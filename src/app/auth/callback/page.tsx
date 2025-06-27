"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchUserMe } from "@/lib/fetch-user";
import { isRoleAllowed } from "@/lib/auth-roles";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

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
        if (!isRoleAllowed(userData.role)) {
          throw new Error(
            `Accès refusé. Votre rôle "${userData.role}" ne permet pas d'accéder à cette interface.`
          );
        }
        document.cookie = `token=${token}; path=/; max-age=${
          7 * 24 * 60 * 60
        }; SameSite=Lax`;
        localStorage.setItem("user", JSON.stringify(userData));
        router.replace(redirectUrl);
      } catch (err: any) {
        setError(err.message || "Erreur d'authentification");
        router.replace(
          `/auth/login?error=auth_failed&redirect=${encodeURIComponent(
            redirectUrl
          )}`
        );
      }
    };

    handleAuth();
  }, [searchParams, router]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
