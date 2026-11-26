import type {SeoPostView} from "@/lib/seo/service-metadata";
import s from "./post-seo-fallback.module.css";

// 2026-11-26: the server HTML of an anonymously open post carries its real title, photos and text, so search engines read
// the post without running the app. The live post page replaces it as soon as the app has loaded (ServiceRouter fallback).
export function PostSeoFallback({post}:{post:SeoPostView}){
 // Fixed KST format (not toLocaleDateString) so the server and browser print the same text during hydration.
 const kst=post.time?new Date(new Date(post.time).getTime()+9*3600_000):null;
 const date=kst&&!Number.isNaN(kst.getTime())?`${kst.getUTCFullYear()}. ${kst.getUTCMonth()+1}. ${kst.getUTCDate()}.`:null;
 return <article className={s.post} data-testid="post-seo-fallback">
  <h1 className={s.title}>{post.title}</h1>
  <p className={s.meta}>{post.author}{post.category?` · ${post.category}`:""}{date?<> · <time dateTime={post.time}>{date}</time></>:null}</p>
  {post.images.map((src,index)=><img key={src} className={s.image} src={src} alt={index?`${post.title} 사진 ${index+1}`:post.title} loading={index?"lazy":"eager"} decoding="async"/>)}
  {post.body?<p className={s.body}>{post.body}</p>:null}
 </article>;
}
