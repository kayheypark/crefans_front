export const imageUploadAccept='image/jpeg,image/png,image/webp';
export const imageUploadMaxBytes=5*1024*1024;
export const videoUploadAccept='video/mp4,video/webm,video/quicktime';
export const videoUploadMaxBytes=300*1024*1024;
/** Post media: images and videos combined, up to this many items. */
export const mediaUploadAccept=`${imageUploadAccept},${videoUploadAccept}`;
export const mediaUploadMaxItems=10;
