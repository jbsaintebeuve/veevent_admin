"use client";

import { useState, useMemo } from "react";
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
import { verifyTicket, parseVerificationKey } from "@/lib/fetch-tickets";
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const { getToken, user } = useAuth();
  const token = useMemo(() => getToken() || undefined, [getToken]);

  const handleVerification = async (verificationKey: string) => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Appeler l'API de vérification avec l'utilisateur connecté
      const result = await verifyTicket(verificationKey, token, user);

      setVerificationResult({
        success: result.isValid,
        data: result,
        error: result.error,
      });

      // Afficher le résultat en plein écran
      setShowResult(true);

      // Masquer le résultat après 3 secondes
      setTimeout(() => {
        setShowResult(false);
        setVerificationResult(null);
        if (isScanning) {
          // Redémarrer le scanner
          setIsScanning(false);
          setTimeout(() => setIsScanning(true), 500);
        }
      }, 3000);
    } catch (error: any) {
      setVerificationResult({
        success: false,
        error: error.message,
      });

      // Afficher l'erreur en plein écran
      setShowResult(true);

      // Masquer l'erreur après 3 secondes
      setTimeout(() => {
        setShowResult(false);
        setVerificationResult(null);
        if (isScanning) {
          // Redémarrer le scanner
          setIsScanning(false);
          setTimeout(() => setIsScanning(true), 500);
        }
      }, 3000);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerification = async () => {
    if (!manualKey.trim()) {
      toast.error("Veuillez saisir une clé de vérification");
      return;
    }

    await handleVerification(manualKey.trim());
    setManualKey("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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

      {/* Résultat en plein écran */}
      {showResult && verificationResult && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            verificationResult.success ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <div className="text-center text-white">
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
                  <p className="text-lg">
                    {verificationResult.data.user.firstName}{" "}
                    {verificationResult.data.user.lastName}
                  </p>
                )}
              </>
            ) : (
              <>
                <XCircle className="mx-auto h-24 w-24 mb-4" />
                <h1 className="text-4xl font-bold mb-2">Ticket Invalide</h1>
                <p className="text-xl">{verificationResult.error}</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Header */}
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
              {/* Scanner QR Code */}
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

                  {isVerifying && (
                    <Alert className="mt-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertDescription>
                        Vérification du ticket en cours...
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Saisie manuelle */}
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
                      onKeyPress={handleKeyPress}
                      disabled={isVerifying}
                    />
                  </div>

                  <Button
                    onClick={handleManualVerification}
                    disabled={!manualKey.trim() || isVerifying}
                    className="w-full"
                  >
                    {isVerifying ? (
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

            {/* Dernier résultat */}
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
