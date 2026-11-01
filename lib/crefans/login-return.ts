// 2026-10-31: after login the member returns to the screen that asked for it, otherwise the home feed.
// Only same-service paths are accepted so the parameter cannot send anyone to another site.
const authScreen=/^\/[^/]+\/(login|signup|reset-password)(\/|\?|#|$)/;
export function loginHref(basePath:string,currentPath:string){
  return currentPath.startsWith(basePath+'/')&&!authScreen.test(currentPath)?`${basePath}/login?next=${encodeURIComponent(currentPath)}`:`${basePath}/login`;
}
export function loginTarget(basePath:string,next:string|null){
  return next&&next.startsWith(basePath+'/')&&!/[\\\s]/.test(next)&&!authScreen.test(next)?next:`${basePath}/feed`;
}
// Holds the email of a signup that just succeeded, for the completion page and the login form (this browser tab only).
export const SIGNUP_COMPLETE_KEY='crefans-signup-complete';
