"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const ref = params.get("ref");

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-200">
      <CheckCircle2 className="mx-auto mb-4 size-14 text-green-500" />
      <h1 className="mb-2 text-2xl font-bold text-zinc-900">Order placed!</h1>
      <p className="mb-1 text-sm text-zinc-600">
        Thank you. Your order is on its way.
      </p>
      {ref && (
        <p className="mb-6 text-xs text-zinc-500">
          Reference: <span className="font-mono">{ref}</span>
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Link
          href="/orders"
          className="inline-block rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          View my orders
        </Link>
        <Link
          href="/market"
          className="inline-block rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
