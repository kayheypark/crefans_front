import {platformRequest} from '@/lib/api/platform';
import {aiPhotoPresetText} from './ai-photo';

type Selection={kind:string;prompt:string};
export async function guestPresetAccess(selections:Selection[],checkSession=false){
 const response=await platformRequest<Selection[]>('/guest/preset-access');
 if(!response.success)throw new Error(response.errorMessage);
 const restricted=selections.some(item=>response.data.some(rule=>rule.kind===item.kind&&rule.prompt===aiPhotoPresetText(item.prompt)));
 if(!restricted)return true;
 if(!checkSession)return false;
 const session=await platformRequest('/session');
 if(!session.success&&session.errorCode!=='UNAUTHORIZED')throw new Error(session.errorMessage);
 return session.success;
}
