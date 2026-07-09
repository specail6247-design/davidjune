/**
 * 브라우저에서 이미지를 리사이즈·압축해 data URL로 반환.
 * Firebase Storage 없이 Firestore 문서(1MB 제한)에 안전하게 저장하기 위해
 * 최대 900px, JPEG 품질을 단계적으로 낮춰 ~600KB 이하를 보장한다.
 */
const MAX_DIMENSION = 900;
const TARGET_BYTES = 600_000;

export const compressImageToDataUrl = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas not supported');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  for (const quality of [0.8, 0.65, 0.5, 0.35, 0.25]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length <= TARGET_BYTES) {
      return dataUrl;
    }
  }

  throw new Error('Image too large even after compression 📸');
};
