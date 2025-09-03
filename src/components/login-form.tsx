"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const redirectUri = `${
    process.env.NEXT_PUBLIC_FRONTEND_URL
  }/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`;
  const { login } = useAuth();
  const backendGoogleLoginUrl = `${
    process.env.NEXT_PUBLIC_BACK_URL
  }/oauth2/authorize/google?redirect_uri=${encodeURIComponent(redirectUri)}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, redirectUrl);
    } catch (err: any) {
      const errorMessage =
        err.message || "Une erreur est survenue lors de la connexion";
      setError(
        "Vos informations de connexion sont incorrectes. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Connexion</CardTitle>
          <CardDescription>
            {redirectUrl !== "/" ? (
              <>
                Connectez-vous pour accéder à{" "}
                <code className="text-sm bg-muted px-1 py-0.5 rounded">
                  {decodeURIComponent(redirectUrl)}
                </code>
              </>
            ) : (
              "Connectez-vous à votre compte administrateur ou organisateur"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full mb-4">
            <Link href={backendGoogleLoginUrl}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-4 h-4 mr-2"
              >
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Connexion avec Google
            </Link>
          </Button>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-card text-muted-foreground relative z-10 px-2">
              Ou continuer avec
            </span>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-6 mt-4">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <a
                  href="#"
                  className="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification des autorisations...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
            <div className="text-center text-sm">
              Besoin d'un compte ?{" "}
              <a
                target="_blank"
                href={`${process.env.NEXT_PUBLIC_VEEVENT_URL}/inscription`}
                className="underline underline-offset-4 hover:text-primary"
              >
                Inscrivez-vous
              </a>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs text-balance">
        Avant de vous connecter, assurez-vous d'avoir un{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          compte organisateur
        </a>{" "}
        actif.
      </div>
    </div>
  );
}
