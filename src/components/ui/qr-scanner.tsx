"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, XCircle, AlertCircle } from "lucide-react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  isScanning: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
}

export function QRScanner({
  onScan,
  onError,
  isScanning,
  onStartScan,
  onStopScan,
}: QRScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier les permissions de caméra
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setHasPermission(true);
        setError(null);
      })
      .catch((err) => {
        setHasPermission(false);
        setError("Permission d'accès à la caméra refusée");
        onError?.(err.message);
      });
  }, [onError]);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const startScanner = () => {
    if (scannerRef.current && !scanner && hasPermission) {
      const newScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [],
        },
        false
      );

      newScanner.render(
        (decodedText) => {
          onScan(decodedText);
        },
        (error) => {
          // Erreurs de scan ignorées pour l'instant
          console.log("Scan error:", error);
        }
      );

      setScanner(newScanner);
      onStartScan();
    }
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
      onStopScan();
    }
  };

  if (hasPermission === false) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || "Permission d'accès à la caméra refusée. Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div id="qr-reader" ref={scannerRef} className="w-full"></div>
      
      <div className="flex gap-2">
        {!isScanning ? (
          <Button 
            onClick={startScanner} 
            className="flex-1"
            disabled={!hasPermission}
          >
            <Camera className="h-4 w-4 mr-2" />
            Démarrer le Scanner
          </Button>
        ) : (
          <Button 
            onClick={stopScanner} 
            variant="outline" 
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Arrêter le Scanner
          </Button>
        )}
      </div>
    </div>
  );
} 