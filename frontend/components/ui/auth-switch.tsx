import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

interface AuthSwitchProps {
  mode?: "login" | "register";
}

export default function AuthSwitch({ mode = "login" }: AuthSwitchProps) {
  const isLogin = mode === "login";

  return (
    <div className={cn("flex items-center justify-center gap-1 text-sm")}>
      <span className="text-white/70">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
      </span>
      <Link
        href={isLogin ? "/register" : "/login"}
        className="text-white font-semibold hover:text-indigo-300 transition-colors"
      >
        {isLogin ? "Sign up" : "Sign in"}
      </Link>
    </div>
  );
}
