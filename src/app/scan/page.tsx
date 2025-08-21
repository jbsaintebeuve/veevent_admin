"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { QRScanner } from "@/components/ui/qr-scanner";
import { toast } from "sonner";
import {
  QrCode,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { verifyTicket } from "@/services/ticket-service";
import { TicketVerificationResponse } from "@/types/ticket";

interface VerificationResult {
  success: boolean;
  data?: TicketVerificationResponse;
  error?: string;
}

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [manualKey, setManualKey] = useState("");
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { token, user } = useAuth();

  const verificationMutation = useMutation({
    mutationFn: async (verificationKey: string) => {
      if (!token) throw new Error("Token manquant");
      console.log("🔍 Vérification du ticket:", verificationKey);
      return await verifyTicket(verificationKey, token, user);
    },
    onSuccess: (result) => {
      console.log("📊 Résultat de vérification:", result);
      setVerificationResult({
        success: result.isValid,
        data: result,
        error: result.error,
      });
      setShowResult(true);
    },
    onError: (error: unknown) => {
      console.error("❌ Erreur lors de la vérification:", error);
      setVerificationResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      setShowResult(true);
    },
    onMutate: () => {
      setVerificationResult(null);
      if (isScanning) {
        setIsScanning(false);
      }
    },
  });

  const handleVerification = (verificationKey: string) => {
    verificationMutation.mutate(verificationKey);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setVerificationResult(null);
  };

  const handleManualVerification = () => {
    if (!manualKey.trim()) {
      toast.error("Veuillez saisir une clé de vérification");
      return;
    }

    handleVerification(manualKey.trim());
    setManualKey("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleManualVerification();
    }
  };

  const handleScanError = (error: string) => {
    toast.error(`Erreur de scan: ${error}`);
  };

  return (
    <>
      <SiteHeader />

      {showResult && verificationResult && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer ${
            verificationResult.success ? "bg-green-500" : "bg-red-500"
          }`}
          onClick={handleCloseResult}
        >
          <div
            className="text-center text-white max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {verificationResult.success ? (
              <>
                <CheckCircle className="mx-auto h-24 w-24 mb-4" />
                <h1 className="text-4xl font-bold mb-2">Ticket Valide</h1>
                {verificationResult.data?.event && (
                  <p className="text-xl mb-1">
                    {verificationResult.data.event.name}
                  </p>
                )}
                {verificationResult.data?.user && (
                  <p className="text-lg mb-4">
                    {verificationResult.data.user.firstName}{" "}
                    {verificationResult.data.user.lastName}
                  </p>
                )}
              </>
            ) : (
              <>
                <XCircle className="mx-auto h-24 w-24 mb-4" />
                <h1 className="text-4xl font-bold mb-2">Ticket Invalide</h1>
                <p className="text-xl mb-4">{verificationResult.error}</p>
              </>
            )}

            <Button
              onClick={handleCloseResult}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Fermer
            </Button>

            <p className="text-sm mt-4 opacity-75">
              Cliquez n'importe où pour fermer
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Scanner de Tickets
                </h1>
                <p className="text-muted-foreground">
                  Scannez les QR codes des tickets pour vérifier leur validité
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 px-4 lg:px-6">
              <Card className="shadow-xs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Scanner QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QRScanner
                    onScan={handleVerification}
                    onError={handleScanError}
                    isScanning={isScanning}
                    onStartScan={() => setIsScanning(true)}
                    onStopScan={() => setIsScanning(false)}
                  />

                  {verificationMutation.isPending && (
                    <Alert className="mt-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertDescription>
                        Vérification du ticket en cours...
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-xs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Saisie Manuelle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-key">Clé de vérification</Label>
                    <Input
                      id="manual-key"
                      placeholder="VV-1-1-1"
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={verificationMutation.isPending}
                    />
                  </div>

                  <Button
                    onClick={handleManualVerification}
                    disabled={!manualKey.trim() || verificationMutation.isPending}
                    className="w-full"
                  >
                    {verificationMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Vérifier le Ticket
                      </>
                    )}
                  </Button>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Format attendu:{" "}
                      <code className="bg-muted px-1 rounded">
                        VV-{"{eventId}"}-{"{orderId}"}-{"{ticketId}"}
                      </code>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            {verificationResult && !showResult && (
              <Card className="mt-6 shadow-xs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Dernier Résultat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {verificationResult.success ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <Badge variant="default" className="bg-green-500">
                          Ticket Valide
                        </Badge>
                      </div>

                      {verificationResult.data?.event && (
                        <div>
                          <h3 className="font-semibold">Événement</h3>
                          <p className="text-muted-foreground">
                            {verificationResult.data.event.name}
                          </p>
                        </div>
                      )}

                      {verificationResult.data?.user && (
                        <div>
                          <h3 className="font-semibold">Participant</h3>
                          <p className="text-muted-foreground">
                            {verificationResult.data.user.firstName}{" "}
                            {verificationResult.data.user.lastName}
                            {verificationResult.data.user.pseudo && (
                              <span className="ml-2 text-sm">
                                (@{verificationResult.data.user.pseudo})
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <Badge variant="destructive">Ticket Invalide</Badge>
                      <span className="text-muted-foreground">
                        {verificationResult.error}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
