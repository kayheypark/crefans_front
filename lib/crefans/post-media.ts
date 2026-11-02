import type {Post,PostMediaItem} from '@/types/crefans';

/** Explicit media (including an empty list) takes precedence over the legacy cover. */
export function getPostMedia(post:Post):PostMediaItem[]{
  return post.media??(post.image?[{type:'image',url:post.image}]:[]);
}
