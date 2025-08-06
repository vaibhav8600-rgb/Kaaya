// Utility for image compression and resizing
// Uses browser-image-compression (npm install browser-image-compression)
import imageCompression from 'browser-image-compression';

export const MAX_IMAGE_SIZE_MB = 2; // 2MB
export const MAX_IMAGE_DIM = 1024; // 1024x1024 px

export async function validateAndCompressImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image.');
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image too large. Please upload an image under ${MAX_IMAGE_SIZE_MB}MB.`);
  }
  // Compress and resize
  const options = {
    maxSizeMB: MAX_IMAGE_SIZE_MB,
    maxWidthOrHeight: MAX_IMAGE_DIM,
    useWebWorker: true,
  };
  const compressedFile = await imageCompression(file, options);
  // Return compressed file and a thumbnail (base64)
  const thumbnail = await imageCompression.getDataUrlFromFile(compressedFile);
  return { compressedFile, thumbnail };
}
