"use client";

import { useEffect, useState } from "react";
import { X, CreditCard, QrCode, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { usePaymentMethodsStore } from "@/store/paymentMethodsStore";
import type { SavedPaymentMethod } from "@/types/api";

type TypeChoice = SavedPaymentMethod["type"];

/**
 * Add-payment-method modal.
 * Two steps:
 *   1. Pick type (Card / ABA Pay / KHQR)
 *   2. Type-specific form
 *
 * NOTE: for "card", we collect a full number for UX (formatted as typed)
 * but ONLY store the last 4. Full PAN never touches localStorage.
 */
export function AddPaymentMethodModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const add = usePaymentMethodsStore((s) => s.add);
  const [step, setStep] = useState<"pick" | TypeChoice>("pick");

  useEffect(() => {
    if (open) setStep("pick");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSaved(m: SavedPaymentMethod) {
    add(m);
    toast.success("Payment method saved");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-zinc-950/60 backdrop-blur-md p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-black tracking-tight text-zinc-950">
            {step === "pick" ? "Add payment method" : `New ${labelFor(step)}`}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="p-6">
          {step === "pick" && <TypePicker onPick={setStep} />}
          {step === "card" && (
            <CardForm onCancel={() => setStep("pick")} onSaved={handleSaved} />
          )}
          {step === "aba" && (
            <AbaForm onCancel={() => setStep("pick")} onSaved={handleSaved} />
          )}
          {step === "khqr" && (
            <KhqrForm onCancel={() => setStep("pick")} onSaved={handleSaved} />
          )}
        </div>
      </div>
    </div>
  );
}

function labelFor(t: TypeChoice) {
  return t === "card" ? "card" : t === "aba" ? "ABA Pay account" : "KHQR account";
}

/* ============================================================
 * Step 1: pick type
 * ============================================================ */
function TypePicker({ onPick }: { onPick: (t: TypeChoice) => void }) {
  const options: { type: TypeChoice; label: string; hint: string; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
    {
      type: "aba",
      label: "ABA Pay",
      hint: "Cambodian mobile bank app",
      icon: QrCode,
      tone: "from-rose-500 to-rose-700",
    },
    {
      type: "card",
      label: "Credit / Debit card",
      hint: "Visa or Mastercard",
      icon: CreditCard,
      tone: "from-indigo-500 to-indigo-700",
    },
    {
      type: "khqr",
      label: "Other KHQR",
      hint: "Any bank that supports KHQR",
      icon: Smartphone,
      tone: "from-emerald-500 to-emerald-700",
    },
  ];

  return (
    <ul className="space-y-2">
      {options.map(({ type, label, hint, icon: Icon, tone }) => (
        <li key={type}>
          <button
            type="button"
            onClick={() => onPick(type)}
            className="flex w-full items-center gap-4 rounded-2xl border-2 border-zinc-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/30"
          >
            <span
              className={`grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-lg`}
            >
              <Icon className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-zinc-950">{label}</p>
              <p className="text-xs text-zinc-500">{hint}</p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ============================================================
 * Step 2a: Card form
 * ============================================================ */
function CardForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: (m: SavedPaymentMethod) => void;
}) {
  const [label, setLabel] = useState("Personal card");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function fmtCard(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function fmtExp(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function detectBrand(num: string): "VISA" | "MASTERCARD" | "OTHER" {
    const clean = num.replace(/\s/g, "");
    if (clean.startsWith("4")) return "VISA";
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return "MASTERCARD";
    return "OTHER";
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const clean = number.replace(/\s/g, "");
    if (clean.length < 12 || !/^\d+$/.test(clean)) {
      setErr("Enter a valid card number.");
      return;
    }
    const [mm, yy] = exp.split("/");
    const m = Number(mm);
    const y = Number(yy);
    if (!m || !y || m < 1 || m > 12) {
      setErr("Enter expiry as MM/YY.");
      return;
    }

    onSaved({
      id: `card-${Date.now()}`,
      type: "card",
      label: label.trim() || "Card",
      brand: detectBrand(number),
      last4: clean.slice(-4),
      expMonth: m,
      // 2-digit year → 20YY
      expYear: y < 100 ? 2000 + y : y,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field label="Label" value={label} onChange={setLabel} placeholder="Personal card" />
      <Field
        label="Card number"
        value={number}
        onChange={(v) => setNumber(fmtCard(v))}
        placeholder="1234 5678 9012 3456"
        mono
      />
      <Field
        label="Expiry"
        value={exp}
        onChange={(v) => setExp(fmtExp(v))}
        placeholder="MM/YY"
        mono
      />
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-900">
        Only the brand and last 4 digits are stored. The full number never
        leaves this form.
      </p>
      {err && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {err}
        </p>
      )}
      <FormFooter onCancel={onCancel} />
    </form>
  );
}

/* ============================================================
 * Step 2b: ABA Pay form
 * ============================================================ */
function AbaForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: (m: SavedPaymentMethod) => void;
}) {
  const [label, setLabel] = useState("Main ABA Pay");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (phone.replace(/\D/g, "").length < 6) {
      setErr("Enter the phone number linked to ABA Pay.");
      return;
    }
    onSaved({
      id: `aba-${Date.now()}`,
      type: "aba",
      label: label.trim() || "ABA Pay",
      phoneNumber: phone.trim(),
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field label="Label" value={label} onChange={setLabel} placeholder="Main ABA Pay" />
      <Field
        label="Phone number"
        value={phone}
        onChange={setPhone}
        placeholder="+855 12 345 678"
      />
      {err && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {err}
        </p>
      )}
      <FormFooter onCancel={onCancel} />
    </form>
  );
}

/* ============================================================
 * Step 2c: KHQR form
 * ============================================================ */
function KhqrForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: (m: SavedPaymentMethod) => void;
}) {
  const [label, setLabel] = useState("Bank KHQR");
  const [bank, setBank] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!bank.trim()) {
      setErr("Enter the bank name.");
      return;
    }
    onSaved({
      id: `khqr-${Date.now()}`,
      type: "khqr",
      label: label.trim() || "KHQR",
      bankName: bank.trim(),
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field label="Label" value={label} onChange={setLabel} placeholder="Bank KHQR" />
      <Field
        label="Bank name"
        value={bank}
        onChange={setBank}
        placeholder="Acleda · Wing · Prince Bank"
      />
      {err && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {err}
        </p>
      )}
      <FormFooter onCancel={onCancel} />
    </form>
  );
}

/* ============================================================
 * Shared tiny helpers
 * ============================================================ */
function Field({
  label,
  value,
  onChange,
  placeholder,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/40 ${
          mono ? "font-mono tracking-wider" : ""
        }`}
      />
    </label>
  );
}

function FormFooter({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        Back
      </button>
      <button
        type="submit"
        className="flex-1 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
      >
        Save
      </button>
    </div>
  );
}
