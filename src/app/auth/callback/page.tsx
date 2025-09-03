"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isProcessing) return;

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

    setIsProcessing(true);
    loginWithToken(token, redirectUrl).catch(() => {
      router.replace(
        `/auth/login?error=auth_failed&redirect=${encodeURIComponent(
          redirectUrl
        )}`
      );
    });
  }, [searchParams, router, loginWithToken, isProcessing]);

  // Ne pas retourner null - laisser ProtectedRoute gérer l'affichage
  return <div></div>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
