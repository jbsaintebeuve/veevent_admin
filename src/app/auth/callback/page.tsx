"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();
  /*
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

    loginWithToken(token, redirectUrl).catch(() => {
      router.replace(
        `/auth/login?error=auth_failed&redirect=${encodeURIComponent(
          redirectUrl
        )}`
      );
    });
  }, [searchParams, router, loginWithToken]); */

  return (
    <div className="flex h-screen items-center justify-center">
      <Image
        src="/google-logo.png"
        width={200}
        height={100}
        alt="Google Logo"
      />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
