import type {AccountModel} from '@/types/crefans-account';
import type {CommonModel,LegalDocument} from '@/types/crefans-common';
const document=(title:string,body:string):LegalDocument=>({title,updatedAt:'2026-10-22',version:'preview-1',sections:[{title:'이용 안내',body}]});
export const previewLegal:CommonModel['legal']={
 terms:document('이용약관','회원가입은 생일 기준 만 19세 이상만 가능합니다. 멤버십의 가격과 이용 기간을 확인한 뒤 구독합니다. 다음 결제 해지를 예약해도 현재 이용 기간은 유지됩니다.'),
 privacy:document('개인정보처리방침','계정과 인증을 위해 이메일·비밀번호 검증 값·닉네임·본인확인 결과를 처리합니다. 개인정보 관련 문의는 고객센터에서 접수할 수 있습니다.'),
 policy:document('운영정책','타인의 권리 침해와 불법 콘텐츠, 계정 공유와 접근 제한 우회는 허용하지 않습니다.'),
};
export const previewAgreements:NonNullable<AccountModel['account']['agreements']>={
 published:true,documents:{terms:previewLegal.terms,privacy:previewLegal.privacy,marketing:document('마케팅 정보 수신 동의','이메일로 서비스 소식과 이벤트 안내를 받습니다. 선택하지 않아도 가입할 수 있으며 설정에서 철회할 수 있습니다.')},
 collection:document('회원가입 개인정보 처리 안내','가입·인증·계정 제공에 필요한 정보를 처리하며 마케팅 수신 여부는 별도로 선택합니다.'),
 versions:{terms:'preview-terms-1',privacy:'preview-privacy-1',marketing:'preview-marketing-1'},
};
