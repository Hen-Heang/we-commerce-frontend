"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";

import { Logo } from "@/components/brand/Logo";
import { api } from "@/lib/api";
import { saveTokens } from "@/lib/auth";
import type { BaseResponse, AuthResponse } from "@/types/api";

/* ---------------- Form schema ---------------- */
// Zod = runtime validation + auto-derived TS types.
// Java analogy: like Bean Validation (@NotBlank, @Pattern) but also gives us types for free.
const PHONE_RE = /^\+?[0-9]{6,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginSchema = z.object({
  // Accepts either a phone number or an email — backend tries phone first,
  // then falls back to email (see PhoneLoginRequest.identifier).
  identifier: z
    .string()
    .min(3, "Enter your phone number or email")
    .refine(
      (v) => PHONE_RE.test(v) || EMAIL_RE.test(v),
      "Enter a valid phone number or email address"
    ),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  /* ---------------- Submit handler ---------------- */
  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      // Backend route: POST /api/v1/auth/loginPhoneNumber
      // `identifier` (phone or email) + password go in the JSON body
      // (PhoneLoginRequest), not the URL path. The path name is legacy —
      // the backend now accepts either identifier type on this route.
      const res = await api.post<BaseResponse<AuthResponse>>(
        `/auth/loginPhoneNumber`,
        { identifier: values.identifier, password: values.password }
      );

      // Unwrap the BaseResponse envelope.
      const payload = res.data?.payload;
      if (res.data?.error || !payload) {
        setServerError(res.data?.message ?? "Login failed");
        return;
      }

      saveTokens(payload.access_token, payload.refresh_token);
      router.push("/market"); // redirect to marketplace after login
    } catch (err) {
      const ax = err as AxiosError<BaseResponse<unknown>>;
      // 401 on bad credentials, 404 if the identifier was never registered.
      setServerError(
        ax.response?.data?.message ?? "Incorrect phone number/email or password"
      );
    }
  }

  return (
    <>
      {/* Hero / branding */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10">
        <Logo className="scale-110" />
        <p className="text-center text-sm text-zinc-500 max-w-[240px]">
          The most modern way to shop and sell in your community.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label
            htmlFor="identifier"
            className="mb-1.5 block text-sm font-bold text-zinc-900 ml-1"
          >
            Phone number or email
          </label>
          <div className="relative group">
            <input
              id="identifier"
              type="text"
              inputMode="email"
              autoComplete="username"
              placeholder="+855 12 345 678 or you@example.com"
              {...register("identifier")}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-base text-zinc-950 placeholder:text-zinc-400 outline-none ring-indigo-500/20 transition-all focus:border-indigo-600 focus:ring-4"
            />
          </div>
          {errors.identifier && (
            <p className="mt-2 text-sm font-bold text-red-600 ml-1">
              {errors.identifier.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-bold text-zinc-900 ml-1"
          >
            Password
          </label>
          <div className="relative group">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password")}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-base text-zinc-950 placeholder:text-zinc-400 outline-none ring-indigo-500/20 transition-all focus:border-indigo-600 focus:ring-4"
            />
          </div>
          {errors.password && (
            <p className="mt-2 text-sm font-bold text-red-600 ml-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 border border-red-100">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
        >
          {isSubmitting ? "Signing in..." : "Continue"}
        </button>
      </form>

      {/* Footer links */}
      <div className="mt-8 space-y-4 text-center">
        <div className="relative flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-zinc-100" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Or continue with</span>
          <div className="h-px flex-1 bg-zinc-100" />
        </div>

        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-base font-bold text-zinc-700 opacity-60 transition-colors"
        >
          <svg className="size-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google Account
        </button>

        <p className="text-sm text-zinc-500 font-medium">
          New to We Commerce?{" "}
          <Link
            href="/register"
            className="text-indigo-600 font-bold hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </>
  );
}
