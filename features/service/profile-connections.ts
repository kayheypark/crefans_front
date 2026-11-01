import {platformRequest} from '@/lib/api/platform';
import type {ConnectionsLoader} from '@/types/crefans';
export const loadProfileConnections:ConnectionsLoader=(id,kind,offset)=>platformRequest(`/profiles/${encodeURIComponent(id)}/connections?kind=${kind}&offset=${offset}`);
