import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Image as ImageIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  id: string;
  label: string;
  file: File | null;
  previewUrl: string | null;
  currentImageUrl?: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
  disabled?: boolean;
  accept?: string;
}

export function ImageUpload({
  id,
  label,
  file,
  previewUrl,
  currentImageUrl,
  onFileChange,
  onRemove,
  disabled = false,
  accept = "image/*",
}: ImageUploadProps) {
  const displayUrl = previewUrl || currentImageUrl;
  const isPreview = !!previewUrl;
  const [imageError, setImageError] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Reset error state when URL changes
  React.useEffect(() => {
    setImageError(false);
  }, [displayUrl]);

  // Validate URL format
  const isValidImageUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const shouldShowImage =
    displayUrl &&
    !imageError &&
    (displayUrl.startsWith("blob:") || isValidImageUrl(displayUrl));

  const handleRemove = () => {
    // Clear the input file
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    // Call the parent's onRemove function
    onRemove?.();
  };

  return (
    <div className="grid gap-3">
      <Label htmlFor={id}>{label}</Label>

      <div className="space-y-3">
        {/* Input file */}
        <Input
          ref={inputRef}
          id={id}
          name={id}
          type="file"
          accept={accept}
          onChange={onFileChange}
          disabled={disabled}
          className="cursor-pointer"
        />

        {/* Image preview */}
        {shouldShowImage && (
          <div className="relative group w-full max-w-sm mx-auto">
            <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border bg-muted">
              <img
                src={displayUrl}
                alt={`Prévisualisation ${label.toLowerCase()}`}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            </div>

            {/* Status badge */}
            <div className="absolute top-2 left-2">
              <Badge
                variant={isPreview ? "default" : "secondary"}
                className="text-xs"
              >
                {isPreview ? "Nouvelle image" : "Image actuelle"}
              </Badge>
            </div>

            {/* Remove button */}
            {onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                disabled={disabled}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Placeholder when no image or error */}
        {(!shouldShowImage || imageError) && (
          <div className="aspect-[16/9] w-full max-w-sm mx-auto border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center bg-muted/50">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              {imageError
                ? "Erreur de chargement de l'image"
                : "Aucune image sélectionnée"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
