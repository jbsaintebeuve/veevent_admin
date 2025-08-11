"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchUserMe } from "@/lib/fetch-user-me";
import { useLogin } from "@/hooks/use-login";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const { storeAuthAndRedirect } = useLogin();

  useEffect(() => {
    const token = searchParams.get("token");
    // Si pas de redirect fourni, on va sur /dashboard
    let redirectUrl = searchParams.get("redirect") || "/dashboard";
    // Si le redirect cible /auth/callback, on force /dashboard
    if (redirectUrl.startsWith("/auth/callback")) {
      redirectUrl = "/dashboard";
    }

    if (!token) {
      setError("Aucun token trouvé dans l'URL de callback.");
      router.replace(
        `/auth/login?error=auth_failed&redirect=${encodeURIComponent(
          redirectUrl
        )}`
      );
      return;
    }

    const handleAuth = async () => {
      try {
        const userData = await fetchUserMe(token);

        // Utilisation de notre hook pour stocker l'authentification et rediriger
        await storeAuthAndRedirect(token, userData, redirectUrl);
      } catch (err: any) {
        setError(err.message || "Erreur d'authentification");
        await router.replace(
          `/auth/login?error=auth_failed&redirect=${encodeURIComponent(
            redirectUrl
          )}`
        );
      }
    };

    handleAuth();
  }, [searchParams, router, storeAuthAndRedirect]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
