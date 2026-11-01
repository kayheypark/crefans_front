export const imageUploadAccept='image/jpeg,image/png,image/webp';
export const imageUploadMaxBytes=5*1024*1024;
// iPhone .mov (QuickTime) is accepted and converted to MP4 on the server (2026-11-01).
export const videoUploadAccept='video/mp4,video/webm,video/quicktime,.mov';
export const videoUploadMaxBytes=300*1024*1024;
/** Post media: images and videos combined, up to this many items. */
export const mediaUploadAccept=`${imageUploadAccept},${videoUploadAccept}`;
export const mediaUploadMaxItems=10;
