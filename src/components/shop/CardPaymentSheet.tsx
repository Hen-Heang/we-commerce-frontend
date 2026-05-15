"use client";

import { useEffect, useState } from "react";
import { X, Loader2, CreditCard, Lock } from "lucide-react";

/**
 * Card payment sheet — visual demo only.
 * In production this would mount Stripe Elements (or ABA PayWay's hosted card form).
 * For now we collect inputs locally and simulate processing.
 */
export function CardPaymentSheet({
  open,
  onClose,
  onPaid,
  amount,
  reference,
}: {
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
  amount: number;
  reference: string;
}) {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [processing, setProcessing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setNumber("");
      setName("");
      setExp("");
      setCvc("");
      setErr(null);
      setProcessing(false);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !processing) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, processing]);

  if (!open) return null;

  // Helpers: format card # and exp as user types
  function fmtCard(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function fmtExp(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const cardLen = number.replace(/\s/g, "").length;
    if (cardLen < 12 || !name.trim() || exp.length < 5 || cvc.length < 3) {
      setErr("Please fill all card details correctly.");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onPaid();
    }, 1800);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-zinc-950/60 backdrop-blur-md p-0 sm:items-center sm:p-4"
      onClick={processing ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between bg-zinc-900 px-5 py-4 text-white">
          <h2 className="inline-flex items-center gap-2 text-base font-black tracking-tight">
            <CreditCard className="size-5" />
            Card payment
          </h2>
          <button
            onClick={onClose}
            disabled={processing}
            aria-label="Close"
            className="rounded-full p-1 text-white/90 hover:bg-white/20 disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </header>

        {/* Amount */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-6 py-5 text-white">
          <p className="text-xs font-medium uppercase tracking-widest text-white/70">
            Charging
          </p>
          <p className="mt-1 text-3xl font-black tracking-tight">
            ${amount.toFixed(2)}
          </p>
          <p className="mt-0.5 text-[10px] font-mono text-white/60">
            Ref: {reference}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-3 px-6 py-5">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Card number
            </span>
            <input
              value={number}
              onChange={(e) => setNumber(fmtCard(e.target.value))}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm tracking-wider outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/40"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Name on card
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="HEANG HEN"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm uppercase tracking-wide outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/40"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
                Expiry
              </span>
              <input
                value={exp}
                onChange={(e) => setExp(fmtExp(e.target.value))}
                placeholder="MM/YY"
                inputMode="numeric"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/40"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
                CVC
              </span>
              <input
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="123"
                inputMode="numeric"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/40"
              />
            </label>
          </div>

          {err && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={processing}
            className="mt-2 w-full rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {processing ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Processing securely...
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <Lock className="size-4" />
                Pay ${amount.toFixed(2)}
              </span>
            )}
          </button>

          <p className="text-center text-[10px] uppercase tracking-widest text-zinc-400">
            Demo only — no real money will be charged
          </p>
        </form>
      </div>
    </div>
  );
}
