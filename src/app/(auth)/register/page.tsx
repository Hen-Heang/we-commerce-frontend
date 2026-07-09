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
import type { BaseResponse, AuthResponse, RegisterRequest } from "@/types/api";

/**
 * Backend's RegisterRequest has 8 fields (role is server-assigned, not
 * client-settable). For the portfolio UI we collect the four genuinely
 * required ones and send sensible defaults for the rest.
 * (See AuthenticationService.register — it tolerates nulls for optional fields.)
 */
const registerSchema = z.object({
  userName: z.string().min(2, "Name is too short").max(50),
  email: z.string().email("Enter a valid email"),
  phoneNumber: z
    .string()
    .min(6, "Phone is too short")
    .regex(/^\+?[0-9]+$/, "Digits only, optional leading +"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { userName: "", email: "", phoneNumber: "", password: "" },
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    try {
      const body: RegisterRequest = {
        ...values,
        // Backend allows nulls for these — we default to undefined.
        address: undefined,
        photoProfile: undefined,
        googleLink: undefined,
        maplink: undefined,
      };

      const res = await api.post<BaseResponse<AuthResponse>>(
        "/auth/register",
        body
      );
      const payload = res.data?.payload;
      if (res.data?.error || !payload) {
        setServerError(res.data?.message ?? "Registration failed");
        return;
      }

      saveTokens(payload.access_token, payload.refresh_token);
      router.push("/market");
    } catch (err) {
      const ax = err as AxiosError<BaseResponse<unknown>>;
      setServerError(
        ax.response?.data?.message ?? "Registration failed. Please try again."
      );
    }
  }

  /* Tiny helper so each field looks the same — avoids repeating className markup */
  function field(
    name: keyof RegisterFormValues,
    label: string,
    placeholder: string,
    extra: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) {
    return (
      <div>
        <label htmlFor={name} className="mb-1.5 block text-sm font-bold text-zinc-900 ml-1">
          {label}
        </label>
        <input
          id={name}
          {...register(name)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-base text-zinc-950 placeholder:text-zinc-400 outline-none ring-indigo-500/20 transition-all focus:border-indigo-600 focus:ring-4"
          {...extra}
        />
        {errors[name] && (
          <p className="mt-2 text-sm font-bold text-red-600 ml-1">{errors[name]?.message}</p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-3 py-6">
        <Logo className="text-4xl scale-110" />
        <p className="text-sm font-medium text-zinc-500">Create your free account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {field("userName", "Full name", "Heang Hen")}
        {field("email", "Email", "you@example.com", {
          type: "email",
          autoComplete: "email",
        })}
        {field("phoneNumber", "Phone number", "+855 12 345 678", {
          type: "tel",
          inputMode: "tel",
          autoComplete: "tel",
        })}
        {field("password", "Password", "At least 6 characters", {
          type: "password",
          autoComplete: "new-password",
        })}

        {serverError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 border border-red-100">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-zinc-500 font-medium">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-600 font-bold hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </>
  );
}
