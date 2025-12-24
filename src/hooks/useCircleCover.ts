import { useMemo } from "react";

const CLOUDINARY_MARKER = "/image/upload/";
const CLOUDINARY_PARAMS_THUMB = "f_auto,h_240,q_auto:best";
const CLOUDINARY_PARAMS = "f_auto,q_auto:best";

const applyCloudinaryTransform = (url: string, isThumbnail = false) => {
  if (!url.includes(CLOUDINARY_MARKER)) return url;
  const [prefix, suffix] = url.split(CLOUDINARY_MARKER);
  if (!prefix || !suffix) return url;
  return `${prefix}${CLOUDINARY_MARKER}${isThumbnail ? CLOUDINARY_PARAMS_THUMB : CLOUDINARY_PARAMS}/${suffix}`;
};

export const useCircleCover = (
  thumbnailUrl?: string | null,
  isThumbnail = false,
) =>
  useMemo(() => {
    if (!thumbnailUrl) return null;
    return applyCloudinaryTransform(thumbnailUrl, isThumbnail);
  }, [thumbnailUrl]);
