'use client';

import {PinPad} from '@/components/ui/PinPad';
import {usePinPad} from '@/hooks/usePinPad';
import s from './custom.module.css';

// Catalog examples only: digits typed here never leave the page.
export function PinPadCatalog(){
  const pad=usePinPad({onComplete:()=>{}}),error=usePinPad(),busy=usePinPad();
  return <section className={s.section}><div className={s.sectionHeading}><h2>PIN 키패드</h2><p>점 6개와 무작위 배열 숫자 키패드로 6자리를 받습니다. PC에서는 숫자키·Backspace·Delete도 사용할 수 있습니다. 값과 배열은 usePinPad가 관리하고, 검증은 화면 모델에서 처리합니다.</p></div><div className={s.controlGrid}>
    <PinPad pad={pad} title="PIN 입력" eyebrow="예시" hint="로컬 예시 번호만 입력해 주세요." autoFocus={false}/>
    <PinPad pad={error} title="PIN 오류" error="PIN이 일치하지 않아요. 다시 입력해 주세요." autoFocus={false}/>
    <PinPad pad={busy} title="확인 중" busy autoFocus={false}/>
  </div></section>;
}
