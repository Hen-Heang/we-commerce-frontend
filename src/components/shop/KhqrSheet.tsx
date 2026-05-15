"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Check } from "lucide-react";

/**
 * KHQR / ABA Pay payment sheet.
 *
 * In a real ABA PayWay integration this would:
 *   1. POST to /api/v1/payment/createIntent → backend returns signed QR payload
 *   2. Render the official QR via ABA's qr-code library
 *   3. Poll backend or open ABA's WebSocket for payment confirmation
 *
 * For the portfolio demo we:
 *   - Render an SVG QR-looking pattern with the order amount embedded
 *   - Show a 60-second countdown (ABA expires unpaid QRs)
 *   - Provide a "Simulate payment" button so the demo flow completes
 */
export function KhqrSheet({
  open,
  onClose,
  onPaid,
  amount,
  reference,
  method = "aba",
}: {
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
  amount: number;
  reference: string;
  method?: "aba" | "khqr";
}) {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [processing, setProcessing] = useState(false);

  // Countdown
  useEffect(() => {
    if (!open) return;
    setSecondsLeft(60);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
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

  const isExpired = secondsLeft === 0;
  const brand = method === "aba" ? "ABA Pay" : "KHQR";
  const brandColor = method === "aba" ? "bg-rose-600" : "bg-emerald-600";

  function handlePaid() {
    setProcessing(true);
    // Simulate the few seconds it takes ABA to confirm a payment.
    setTimeout(() => {
      setProcessing(false);
      onPaid();
    }, 1500);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 sm:items-center sm:p-4"
      onClick={processing ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — brand-colored */}
        <header
          className={`${brandColor} flex items-center justify-between px-5 py-4 text-white`}
        >
          <h2 className="text-base font-black tracking-tight">
            {brand}
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

        {/* Body */}
        <div className="px-6 py-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Amount to pay
          </p>
          <p className="mt-1 text-4xl font-black tracking-tight text-zinc-950">
            ${amount.toFixed(2)}
          </p>
          <p className="mt-0.5 text-[10px] font-mono text-zinc-400">
            Ref: {reference}
          </p>

          {/* QR placeholder */}
          <div className="mx-auto mt-6 grid size-56 place-items-center rounded-2xl border-4 border-zinc-900 bg-white p-3">
            <QrPattern />
          </div>

          {/* Countdown / state */}
          <div className="mt-5">
            {isExpired ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                ⏱ QR expired — close and try again
              </p>
            ) : processing ? (
              <p className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">
                <Loader2 className="size-3.5 animate-spin" />
                Confirming payment with bank...
              </p>
            ) : (
              <p className="text-xs font-medium text-zinc-600">
                Scan with {brand} app · expires in{" "}
                <span className="font-mono font-bold text-zinc-900">
                  {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
                  {String(secondsLeft % 60).padStart(2, "0")}
                </span>
              </p>
            )}
          </div>

          <p className="mt-4 text-[10px] uppercase tracking-widest text-zinc-400">
            Demo only — no real money will be charged
          </p>
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-100 p-5">
          <button
            onClick={handlePaid}
            disabled={isExpired || processing}
            className={`w-full rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition disabled:opacity-50 ${
              processing ? "bg-zinc-700" : `${brandColor} hover:opacity-90`
            }`}
          >
            {processing ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Verifying...
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <Check className="size-4" />
                Simulate payment received
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="mt-2 w-full text-xs font-semibold text-zinc-500 hover:text-zinc-700 disabled:opacity-50"
          >
            Cancel and choose another method
          </button>
        </footer>
      </div>
    </div>
  );
}

/**
 * Decorative QR-code-looking SVG. Not a real scannable QR — this is a portfolio
 * demo. Replace with `qrcode.react` and a real ABA payload string in production.
 */
function QrPattern() {
  // 21x21 grid mock pattern. Built once, looks consistent.
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    // Quiet zone around finder patterns; pseudo-random rest based on index.
    const x = i % 21;
    const y = Math.floor(i / 21);
    // Three finder patterns (top-left, top-right, bottom-left)
    const isFinder =
      (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    if (isFinder) {
      const fx = x % 7;
      const fy = y % 7;
      const border = fx === 0 || fx === 6 || fy === 0 || fy === 6;
      const center = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
      return border || center ? 1 : 0;
    }
    // Stable pseudo-random
    const seed = (x * 131 + y * 7 + 11) % 5;
    return seed < 2 ? 1 : 0;
  });

  return (
    <svg viewBox="0 0 21 21" className="size-full" aria-hidden>
      {cells.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={i % 21}
            y={Math.floor(i / 21)}
            width="1"
            height="1"
            fill="#0a0a0a"
          />
        ) : null
      )}
      {/* ABA logo-like center mark */}
      <rect x="9" y="9" width="3" height="3" fill="#fff" />
      <rect x="9.4" y="9.4" width="2.2" height="2.2" fill="#0a0a0a" />
    </svg>
  );
}
