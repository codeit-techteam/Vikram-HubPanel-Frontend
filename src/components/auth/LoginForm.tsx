"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, User } from "lucide-react";
import { AssignedTerminalCard } from "@/components/auth/AssignedTerminalCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/services/axios";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const loginSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      employeeId: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    setIsLoading(true);

    try {
      await login(data.employeeId.trim(), data.password);
      router.replace("/dashboard");
    } catch (error) {
      setAuthError(getApiErrorMessage(error));
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const employeeId = getValues("employeeId")?.trim();
    if (!employeeId) {
      setAuthError("Enter your Employee ID first to request a password reset.");
      return;
    }

    setIsForgotLoading(true);
    setAuthError(null);
    try {
      await authService.forgotPassword(employeeId);
      toast.success("Password reset request sent to administrator.");
    } catch (error) {
      setAuthError(getApiErrorMessage(error));
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Welcome Back, Hub Manager
        </h1>
        <p className="text-sm text-gray-500">
          Access your dark store inventory and dispatch workflows.
        </p>
      </div>

      <AssignedTerminalCard location="Your assigned hub appears after login" />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="employeeId"
            className="text-xs font-medium text-gray-600"
          >
            Username / Employee ID
          </Label>
          <div className="relative transition-transform duration-200 focus-within:scale-[1.005]">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="employeeId"
              type="text"
              placeholder="e.g. rahul.sharma"
              autoComplete="username"
              className={cn(
                "flex h-11 w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                errors.employeeId ? "border-red-400" : "border-gray-200",
              )}
              {...register("employeeId")}
            />
          </div>
          {errors.employeeId && (
            <p className="text-xs text-red-500">{errors.employeeId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs font-medium text-gray-600"
            >
              Secure Password
            </Label>
            <button
              type="button"
              disabled={isForgotLoading}
              onClick={handleForgotPassword}
              className="text-xs font-medium text-[#FF6B00] transition-colors hover:text-[#E55F00] hover:underline disabled:opacity-50"
            >
              {isForgotLoading ? "Sending..." : "Forgot Password?"}
            </button>
          </div>
          <PasswordInput
            id="password"
            placeholder="********"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>
      </div>

      {authError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {authError}
        </p>
      )}

      <PrimaryButton
        type="submit"
        loading={isLoading}
        icon={<ArrowRight className="h-4 w-4" />}
      >
        Authorize & Login
      </PrimaryButton>

      <div className="flex items-center justify-center gap-2 pt-1">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Verified Secure Terminal
        </span>
      </div>
    </form>
  );
}
