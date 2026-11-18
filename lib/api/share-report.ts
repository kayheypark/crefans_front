// 2026-11-19 user request: every share button press (AI 사진 결과 화면의 공유, 게시물 공유 창) goes to the operations Telegram,
// because a visitor can send the photo to KakaoTalk without ever posting. Labels only; never awaited, never blocks or fails the share.
export type ShareReport={where:'ai_result';method:'native'|'download';outcome:'done'|'cancelled'|'failed'}
 |{where:'post';method:'kakao'|'copy'|'more';outcome:'done'|'cancelled'|'failed';postId?:string};
export function reportShare(report:ShareReport){
 try{void fetch('/api/v1/telemetry/share',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(report),keepalive:true}).catch(()=>{});}catch{/* never break sharing */}
}
