import { CLOUDINARY_CONFIG, getCloudinaryUploadUrl } from "./cloudinary-config";

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.UPLOAD_PRESET);

  const response = await fetch(getCloudinaryUploadUrl(), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l'upload de l'image");
  }

  const data = await response.json();
  return data.secure_url; // L’URL Cloudinary de l’image
}
