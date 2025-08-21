export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: "dtepwacbx", // Ton cloud name
  UPLOAD_PRESET: "veevent", // Le nom exact de ton preset
  API_URL: "https://api.cloudinary.com/v1_1/dtepwacbx/image/upload",
};

export function getCloudinaryUploadUrl(): string {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`;
}
