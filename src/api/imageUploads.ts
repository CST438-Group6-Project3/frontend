import { supabase } from "../../lib/supabaseClient";

const LOCATION_IMAGES_BUCKET =
  process.env.EXPO_PUBLIC_LOCATION_IMAGES_BUCKET ?? "location-images";

export const MAX_LOCATION_IMAGES = 10;

export type SpotImageUpload = {
  file?: File;
  uri?: string;
  fileName: string;
  mimeType: string;
};

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
}

function getStoragePath(userId: string, fileName: string, index: number) {
  const safeFileName = sanitizeFileName(fileName || `image-${index}.jpg`);
  const uniquePart = `${Date.now()}-${index}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

  return `${userId}/locations/${uniquePart}-${safeFileName}`;
}

async function getUploadBody(image: SpotImageUpload) {
  if (image.file) {
    return image.file;
  }

  if (!image.uri) {
    throw new Error("Image is missing upload data.");
  }

  const response = await fetch(image.uri);
  return response.blob();
}

export async function uploadLocationImages(
  images: SpotImageUpload[],
  userId: string
) {
  const uploadedUrls: string[] = [];

  for (const [index, image] of images.entries()) {
    const path = getStoragePath(userId, image.fileName, index);
    const body = await getUploadBody(image);

    const { error } = await supabase.storage
      .from(LOCATION_IMAGES_BUCKET)
      .upload(path, body, {
        contentType: image.mimeType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from(LOCATION_IMAGES_BUCKET)
      .getPublicUrl(path);

    uploadedUrls.push(data.publicUrl);
  }

  return uploadedUrls;
}
