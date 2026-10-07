# CREFANS 검수용 화면 이미지 — V1

Source of truth: 사용자 첨부 14개 화면 목업 `/var/folders/rl/p0pspjhd0fs1_1v9y7nf1wj40000gn/T/codex-clipboard-e0981787-13a1-430e-a3a2-27efaa0358d1.png`.

## 모든 이미지의 공통 기준

- 원본의 각 해당 패널을 재현한다. 임의로 레이아웃을 새롭게 제안하지 않는다.
- 완성된 실제 서비스 화면의 flat UI image. 브라우저 틀/폰 테두리/기울어진 종이/외부 drop shadow/보드 제목/여러 화면 montage 금지.
- 화면마다 독립적인 한 장, portrait 1024×1536 또는 같은 비율의 고해상도. 텍스트는 한국어를 정확히, 부드러운 흰색 배경, 아주 연한 라벤더 surface, near-black maintext, purple outlined heart + crefans logo. 원본에 있는 흑색 auth CTA, 보라색 subscribe/active accent, 작은 border/radius 유지.
- 여성 크리에이터는 성인 25~30대, 사진실사. 사용자가 승인한 새 hero와 여성 asset을 reference로 사용가능.
- 기능 텍스트 변경은 검수 문서에 기록한 의도된 UX 보완만 허용. API 실제 지원이 확인되지 않은 기능을 운영중이라고 주장하지 않는다.
- 가격/개수/날짜는 검수용 목업 데이터. 원본 tier ₩9,900/₩19,900/₩49,900을 재사용하며 추가 매출수치 생성금지.
- 법률문구나 정책을 확정하지 않는다. 구독결제전 확인, 자동갱신, 취소유효기간, 콘텐츠 권한 분기 같은 인터랙션 계약을 설계에 표시한다.
- 새 이미지 안에는 장황한 개발 메모/"AI"표시/화면번호를 넣지 않는다. 이들은 외부 검수보드에서 표시한다.

Output: screens/NN-slug.png + prompts-NN.md (최종 프롬프트, 도구, output 원본경로).
