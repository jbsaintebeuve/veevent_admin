"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    let redirectUrl = searchParams.get("redirect") || "/dashboard";
    if (redirectUrl.startsWith("/auth/callback")) redirectUrl = "/dashboard";

    if (!token) {
      router.replace(
        `/auth/login?error=auth_failed&redirect=${encodeURIComponent(
          redirectUrl
        )}`
      );
      return;
    }

    login(token, token, redirectUrl).catch(() => {
      router.replace(
        `/auth/login?error=auth_failed&redirect=${encodeURIComponent(
          redirectUrl
        )}`
      );
    });
  }, [searchParams, router, login]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
