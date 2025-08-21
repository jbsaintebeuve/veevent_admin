import { CLOUDINARY_CONFIG, getCloudinaryUploadUrl } from "./cloudinary-config";

export async function uploadImage(file: File): Promise<string> {
  console.log("📤 Début de l'upload vers Cloudinary:", {
    fileName: file.name,
    fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    fileType: file.type,
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.UPLOAD_PRESET);

  const uploadUrl = getCloudinaryUploadUrl();
  console.log("🌐 Upload URL:", uploadUrl);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Erreur upload Cloudinary:", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    });
    throw new Error(
      `Erreur lors de l'upload de l'image: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();
  console.log("✅ Upload Cloudinary réussi:", {
    public_id: data.public_id,
    secure_url: data.secure_url,
    format: data.format,
    width: data.width,
    height: data.height,
  });

  return data.secure_url; // L'URL Cloudinary de l'image
}
