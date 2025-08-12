"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  XCircle,
  AlertCircle,
  RotateCcw,
  Play,
  Square,
} from "lucide-react";

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
  const [availableCameras, setAvailableCameras] = useState<QrScanner.Camera[]>(
    []
  );
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialisation des permissions et caméras disponibles
  useEffect(() => {
    const initializeCameras = async () => {
      try {
        // Vérifier les permissions de caméra
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
        setError(null);

        // Lister les caméras disponibles
        const cameras = await QrScanner.listCameras(true);
        setAvailableCameras(cameras);

        // Sélectionner la caméra arrière par défaut si disponible
        const backCamera = cameras.find(
          (camera) =>
            camera.label.toLowerCase().includes("back") ||
            camera.label.toLowerCase().includes("rear") ||
            camera.label.toLowerCase().includes("environment")
        );

        setCurrentCameraId(backCamera?.id || cameras[0]?.id || null);
        setIsInitialized(true);
      } catch (err: any) {
        console.error("Erreur d'initialisation:", err);
        setHasPermission(false);
        setError("Permission d'accès à la caméra refusée");
        onError?.(err.message);
      }
    };

    initializeCameras();
  }, [onError]);

  // Nettoyage du scanner
  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.destroy();
      }
    };
  }, [scanner]);

  const startScanner = async () => {
    if (videoRef.current && !scanner && hasPermission && currentCameraId) {
      try {
        const newScanner = new QrScanner(
          videoRef.current,
          (result) => {
            // Arrêter le scanner immédiatement après un scan
            newScanner.stop();
            setScanner(null);
            onStopScan();
            // Ensuite appeler le callback
            onScan(result.data);
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: currentCameraId,
          }
        );

        await newScanner.start();
        setScanner(newScanner);
        onStartScan();
        setError(null);
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

  const switchCamera = async () => {
    if (availableCameras.length < 2) return;

    const currentIndex = availableCameras.findIndex(
      (camera) => camera.id === currentCameraId
    );
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCameraId = availableCameras[nextIndex].id;

    // Arrêter le scanner actuel
    if (scanner) {
      scanner.destroy();
      setScanner(null);
    }

    // Changer de caméra
    setCurrentCameraId(nextCameraId);

    // Redémarrer avec la nouvelle caméra si on était en train de scanner
    if (isScanning) {
      try {
        const newScanner = new QrScanner(
          videoRef.current!,
          (result) => {
            onScan(result.data);
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: nextCameraId,
          }
        );

        await newScanner.start();
        setScanner(newScanner);
      } catch (err: any) {
        console.error("Erreur lors du changement de caméra:", err);
        setError(err.message);
        onError?.(err.message);
        onStopScan();
      }
    }
  };

  if (hasPermission === false) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error ||
            "Permission d'accès à la caméra refusée. Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!isInitialized) {
    return (
      <div className="space-y-4">
        <div
          className="w-full max-w-md mx-auto bg-muted rounded-lg border flex items-center justify-center"
          style={{ aspectRatio: "1/1" }}
        >
          <div className="text-center">
            <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Initialisation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-md mx-auto">
        <video
          ref={videoRef}
          className="w-full rounded-lg border"
          style={{ aspectRatio: "1/1" }}
          playsInline
          muted
        />
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-white rounded-lg shadow-lg animate-pulse">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
            </div>
          </div>
        )}
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="text-center text-white">
              <Camera className="h-12 w-12 mx-auto mb-2" />
              <p>Appuyez pour scanner</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        {!isScanning ? (
          <Button
            onClick={startScanner}
            className="flex-1"
            disabled={!hasPermission || !currentCameraId}
          >
            <Play className="h-4 w-4 mr-2" />
            Démarrer le Scanner
          </Button>
        ) : (
          <Button
            onClick={stopScanner}
            variant="destructive"
            className="flex-1"
          >
            <Square className="h-4 w-4 mr-2" />
            Arrêter le Scanner
          </Button>
        )}

        {availableCameras.length > 1 && (
          <Button
            onClick={switchCamera}
            variant="outline"
            disabled={!hasPermission}
            title="Changer de caméra"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {availableCameras.length > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          Caméra actuelle:{" "}
          {availableCameras.find((c) => c.id === currentCameraId)?.label ||
            "Inconnue"}
        </div>
      )}
    </div>
  );
}
