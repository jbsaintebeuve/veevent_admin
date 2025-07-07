"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
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
        scanner.destroy();
      }
    };
  }, [scanner]);

  const startScanner = async () => {
    if (videoRef.current && !scanner && hasPermission) {
      try {
        const newScanner = new QrScanner(
          videoRef.current,
          (result) => {
            onScan(result.data);
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        await newScanner.start();
        setScanner(newScanner);
        onStartScan();
      } catch (err: any) {
        console.error("Erreur lors du démarrage du scanner:", err);
        setError(err.message);
        onError?.(err.message);
      }
    }
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.destroy();
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
      <div className="relative w-full max-w-md mx-auto">
        <video
          ref={videoRef}
          className="w-full rounded-lg border"
          style={{ aspectRatio: "1/1" }}
        />
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white rounded-lg shadow-lg"></div>
          </div>
        )}
      </div>
      
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