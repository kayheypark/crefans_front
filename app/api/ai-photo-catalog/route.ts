import {aiPhotoCatalog} from '@/lib/crefans/ai-photo-catalog';
// Read by the ops console (admin.crefans.com / admin-dev / local). Public data, so any origin may read it.
export const dynamic='force-static';
export function GET(){return Response.json(aiPhotoCatalog(),{headers:{'Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=300'}});}
