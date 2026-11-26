import type {SeoPostView} from "@/lib/seo/service-metadata";
import s from "./post-seo-fallback.module.css";

// 2026-11-26: the server HTML of an anonymously open post carries its real title, photos and text, so search engines read
// the post without running the app. The live post page replaces it as soon as the app has loaded (ServiceRouter fallback).
export function PostSeoFallback({post}:{post:SeoPostView}){
 const date=post.time?new Date(post.time):null;
 return <article className={s.post} data-testid="post-seo-fallback">
  <h1 className={s.title}>{post.title}</h1>
  <p className={s.meta}>{post.author}{post.category?` · ${post.category}`:""}{date&&!Number.isNaN(date.getTime())?<> · <time dateTime={post.time}>{date.toLocaleDateString("ko-KR",{timeZone:"Asia/Seoul"})}</time></>:null}</p>
  {post.images.map((src,index)=><img key={src} className={s.image} src={src} alt={index?`${post.title} 사진 ${index+1}`:post.title} loading={index?"lazy":"eager"} decoding="async"/>)}
  {post.body?<p className={s.body}>{post.body}</p>:null}
 </article>;
}
