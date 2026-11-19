import {aiPhotoRefillCalendar} from '@/lib/crefans/ai-photo-calendar';
// Serves lib/crefans/ai-photo-calendar.ts as a calendar file (2026-11-20 user request).
export async function GET(request:Request){
 const member=new URL(request.url).searchParams.get('for')==='member';
 return new Response(aiPhotoRefillCalendar(Date.now(),member),{headers:{'Content-Type':'text/calendar; charset=utf-8','Content-Disposition':'inline; filename="crefans-ai-photo-refill.ics"','Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
}
