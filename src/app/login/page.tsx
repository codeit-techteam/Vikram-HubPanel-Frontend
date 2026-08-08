"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BackgroundIcons } from "@/components/auth/BackgroundIcons";
import { LoginForm } from "@/components/auth/LoginForm";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { useAuthStore } from "@/store";

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <Header />

      <main className="relative flex flex-1 items-center justify-center px-4 pb-8 pt-24 sm:px-6">
        <BackgroundIcons />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-[420px] rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:p-8"
        >
          <LoginForm />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
