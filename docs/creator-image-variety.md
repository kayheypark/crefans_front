# 크리에이터 이미지 장소·포즈 변형

## 지우 배경 자연스러움 보정 (2026-10-24, v2)

사용자 요청에 따라 지우의 기존5장을 built-in `image_gen.imagegen` 참조 편집으로 수정했다. 인물3장은 얼굴·헤어·의상·포즈·구도를 유지하도록 요청했고, 배경의 과장된 산세·청록색 물빛·강한 역광을 평범한 산책로/해안길/저수지 캠핑장과 부드러운 자연광으로 바꿨다. 이미지 자연스러움과 얼굴 유지 여부는 결과를 직접 육안 검토한 판단이며 자동 검사로 사실성을 보장한 것은 아니다. 가상 인물/장소 이미지이고 실제 촬영 기록은 아니다.

| 용도 | 현재 로컬 자산 |
| --- | --- |
| 프로필 | `public/illustrations/creators/jiwoo/avatar-trail-v2.png` |
| 배경 | `public/illustrations/creators/jiwoo/cover-lakeside-v2.png` |
| 여행 게시물 | `public/illustrations/creators/jiwoo/coastal-walk-v2.png` |
| 캠핑 게시물 | `public/illustrations/creators/jiwoo/camp-morning-v2.png` |
| 멤버십 캠핑 기록 | `public/illustrations/creators/jiwoo/camp-coffee-v2.png` |

v1과 생성 원본을 보존하고 v2 파일을 프로젝트에 그대로 복사했다. 전체 프롬프트/입력/출력은 [v2 생성 기록](../public/illustrations/creators/jiwoo/generation-v2.json). `landing.ts`와 게시물 fixture의 이미지 경로만 변경해 랜딩·탐색·프로필·피드가 공유한다. 크리에이터 수·게시물 내용·공개 권한은 그대로다. 레이어·타입 검사, Chromium320/390/1280·WebKit390에서 프로필/배경 확대·갤러리 넘김·미디어/소개·여행 필터·탐색·목업/서비스 에셋 랜딩·상세3경로 확인, 제공되는 PNG5개 해시 일치를 확인했다. [검증 증거](./audit/jiwoo-natural-20261024.json). 최초 브라우저 재사용 스크립트의 응답 변수 오류는 수정해 재검증했고 원본 로그를 남겼다.

**v2는 `membership-ui-20261024`로 운영 배포 완료했다.** [운영 배포 증거](./audit/membership-ui-deployment-20261024.json)에 이미지/운영 소스·사진 해시와 브라우저 검증을 기록했다. v1 파일은 보존했고 실제 운영 DB의 크리에이터·게시물은 수정하지 않았다. 물리 실기기 확인은 이번 검증에 포함되지 않는다.


## 목업 인물 구성 조사 및 지우 여행·캠핑 보강 (2026-10-24)

### 조사 범위와 판단

`lib/content/landing.ts`, `components/preview/service/fixtures.ts`, `CreatorPages.tsx`, `ProfileHeader.tsx`, `SocialPages.tsx`의 실제 연결과 사진을 확인했다. 조사 시작 시 크리에이터8명·게시물13개였고, 지우 보강 후8명·15개다. 인원수10명 권장은 업계의 정해진 기준이 아니라 **현재9개 카테고리와 기존 인물을 유지할 때 빠진 분야를 채우는 최소 구성안**이다. 운영 DB에 실제 크리에이터를 추가하는 계획은 아니다.

| 인물 | 작업 전 게시물 | 확인한 부족분 | 권장 처리 |
| --- | ---: | --- | --- |
| 모카 | 3 | 전용 프로필·배경·공개/멤버 전용 게시물이 있음 | 현재 구성 유지 |
| 시온 | 2 | 배경과 첫 게시물에 같은 화보 사용, 두 번째는 텍스트 | 다음 단계에서 배경 및 다른 촬영 사진 보강 |
| 하늘 | 6 | 사진·영상·공개 레벨 사례는 충분, 별도 배경 없이 프로필 사진 재사용 | 배경사진만 우선 분리 |
| 지우 | 1 | 테라스 한 장을 프로필·배경·게시물에 반복 사용 | 이번에 새5장, 전용 배경, 게시물3개로 보강 |
| 서연 | 1 | 멤버 전용 글1개, 소개·전용 배경 없음 | 음악 작업 사진, 공개 글2개, 소개·배경 우선 보강 |
| 예린 | 0 | 피트니스·라이프스타일 인물은 있으나 피드가 비어 있음 | 운동/웰니스 사진, 공개·멤버 전용 글3개, 소개·배경 우선 보강 |
| 민지 | 0 | 프로필 사진만 있고 피드·소개·전용 배경 없음 | 소통·라이브 준비 과정으로 후속 보강 |
| 수아 | 0 | 민지의 기존 원본 사진(`redesign/minji.png`) 사용, 피드·소개·배경 없음 | 인물 사진을 분리하되 빈 프로필 검수 사례로 유지 가능 |

- **신규2명 권장:** 뷰티1명 + 게임1명. 이 두 카테고리는 인물이 전혀 없다. 추가하면 총10명이다. 신규 생성·추가는 아직 하지 않았다.
- 기존 인물 보강 순서: 지우 → 예린·서연 → 하늘·시온 배경 → 민지·수아 정리. 숫자를 늘리기 전에 비어 있는 실제 화면을 채운다.
- 동일한 제작 묶음이 크게 필요한 기존 인물은 지우·서연·예린·민지이며, 하늘은 배경만으로 충분하다. 시온은 보조 화보, 수아는 별도 얼굴과 빈 상태 검수 여부를 정하면 된다.
- 최소 제작 묶음 권장: 인물마다 프로필1장·배경1장·활동 사진3장, 공개 게시물2개·멤버 전용1개. 사진 수/공개 상태는 시연 목적이며 실제 운영 가격·혜택을 변경하는 정책이 아니다.
- 현재 분류9개 중 뷰티·게임은 인물0명, 피트니스·라이프스타일은 예린이 있지만 게시물0개다. 아트는 모카·시온의 코스프레 태그로 이미 채워지므로 순수미술 인물은 선택적인 다음 단계다. 탐색의 기존 주목 카드5명/간단 목록3명 구성은 유지했다.
- 랜딩의 상위5명에는 지우가 이미 포함되어 있다. 같은 공유 데이터로 랜딩·탐색·프로필·멤버십 인물 표시가 갱신되고, 피드는 별도의 게시물 fixture를 보강해야 한다. `ProfileHeader`의 `cover ?? image` 때문에 별도 cover가 없는6명이 프로필 사진을 배경으로도 사용하고 있었다.

### 1차 적용 (v1, 운영 배포 이력)

기존 가상 성인 지우의 얼굴·갈색 긴 머리·앞머리를 참조해 built-in `image_gen.imagegen`으로 새 사진5장을 제작했다. 프로필/바닷길/캠핑 인물 사진은 정체성 참조 편집이고, 호숫가 배경/커피 정물은 새 생성이다. 실제 촬영이나 실제 여행 장소를 주장하는 자료가 아니다. 원본은 보존하고 아래 프로젝트 경로에 그대로 복사했다.

| 용도 | 프로젝트 자산 |
| --- | --- |
| 프로필 | `public/illustrations/creators/jiwoo/avatar-trail-v1.png` |
| 배경 | `public/illustrations/creators/jiwoo/cover-lakeside-v1.png` |
| 여행 게시물 | `public/illustrations/creators/jiwoo/coastal-walk-v1.png` |
| 캠핑 게시물 | `public/illustrations/creators/jiwoo/camp-morning-v1.png` |
| 멤버십 캠핑 기록 | `public/illustrations/creators/jiwoo/camp-coffee-v1.png` |

사진별 전체 프롬프트·도구·입력 참조·생성 원본은 [생성 기록](../public/illustrations/creators/jiwoo/generation.json)에 있다. 기존 `/preview/post/travel` 경로를 유지하고 `/preview/post/jiwoo-camp-morning`, `/preview/post/jiwoo-camp-coffee` 두 글을 추가했다. 공개2개/레벨1 전용1개이며, 캠핑 게시물은 인물과 풍경 두 장으로 갤러리를 구성한다. 기존 구독/금액/권한 로직과 다른 인물은 변경하지 않았다.

조사·로컬 검증은 [지우 목업 보강 기록](./audit/jiwoo-content-20261024.json)을 따른다. 사용자 승인 후 프론트 `jiwoo-20261024`로 운영 목업과 에셋 랜딩에 배포했다. [운영 배포 증거](./audit/jiwoo-deployment-20261024.json)에 선택 소스·이미지/운영486파일·공개사진5개 해시와 모바일/PC 브라우저 검증을 기록했다. 실제 운영 DB의 크리에이터·게시물은 추가하지 않았다. 아래 장소·포즈 변형 기록은 기존 자산의 생성 이력이다.

기존 성인 모델의 외모·헤어·의상과 고급스러운 분위기를 유지하고 포즈와 장소를 변경한다. Built-in imagegen에 기존 모델 사진을 `referenced_image_paths`로 전달한 참조 편집 결과다. 기존 대표 모델 사진 `public/illustrations/redesign/hero-woman.png`는 유지한다.

아래 최종 자산은 모두 1536×1024 PNG다. 생성 원본은 삭제하지 않았으며 프로젝트 복사본과 바이트가 동일한지 확인했다. 코드는 이 문서와 별도로 공통 표시 컴포넌트에 이미지 데이터를 주입한다.

## 지우 — 야외 테라스

- 입력 참조 원본: `/Users/ethan/repository/crefans_front/public/illustrations/redesign/jiwoo.png`
- 생성 원본: `/Users/ethan/.codex/generated_images/01a099c0-c817-7481-99ee-0952fcb9570b/exec-c36b1c3c-b1a5-40af-87cd-7a231e9f0352.png`
- 프로젝트 저장 경로: `/Users/ethan/repository/crefans_front/public/illustrations/redesign/variety/jiwoo-terrace-v3.png`
- 웹 자산 경로: `/illustrations/redesign/variety/jiwoo-terrace-v3.png`
- 카드 배치 권장값: `object-position: 50% 32%`

실제 전달한 전체 프롬프트:

```text
Use case: identity-preserve. Edit the supplied reference photo into ONE standalone landscape 3:2 premium editorial photograph. The woman in the reference is a fictional adult in her early twenties. Preserve her SAME identity, exact face proportions and facial features, youthful adult appearance, long softly wavy light-brown hair with the same airy wispy bangs, delicate polished makeup, natural luminous skin, and the same soft white short-sleeve blouse styling. Do not replace her with another model; do not make her older; do not shorten her hair or add freckles. Change ONLY her pose, expression slightly, and setting. Place her at a bright sophisticated outdoor terrace travel cafe in an elegant city, with beautiful softly blurred architecture, cream parasols and subtle greenery behind her, clearly outdoors and not a home or bedroom. She is lightly leaning forward onto a small cafe table with relaxed arms and a small warm closed-mouth smile, looking toward the camera. Keep the refined, pretty, premium photographic atmosphere and skin finish of the reference rather than a rugged documentary look. Natural soft daylight, realistic anatomy. Chest-up to waist-up portrait, face centered horizontally in the upper-middle of the frame with full hair/head visible and modest headroom for profile-card cropping; enough environment to establish the terrace location. No text, logos, watermark, border or collage.
```

## 서연 — 음악 리스닝룸

- 입력 참조 원본: `/Users/ethan/repository/crefans_front/public/illustrations/redesign/seoyeon.png`
- 생성 원본: `/Users/ethan/.codex/generated_images/01a099c0-c817-7481-99ee-0952fcb9570b/exec-82d71649-dbe9-453a-811a-c279ea2ae994.png`
- 프로젝트 저장 경로: `/Users/ethan/repository/crefans_front/public/illustrations/redesign/variety/seoyeon-music-v3.png`
- 웹 자산 경로: `/illustrations/redesign/variety/seoyeon-music-v3.png`
- 카드 배치 권장값: `object-position: 54% 35%`

실제 전달한 전체 프롬프트:

```text
Use case: identity-preserve. Edit the supplied reference photo into ONE standalone landscape 3:2 premium editorial photograph. The woman in the reference is a fictional adult in her early twenties. Preserve her SAME identity, exact face proportions and facial features, youthful adult appearance, long smooth black hair and the same soft parted wispy bangs, polished delicate makeup, naturally luminous fair skin, and her existing simple fitted black top styling. Do not replace her with another model; do not make her older, change her face shape, add a blunt fringe or change hair length. Change ONLY her pose, expression slightly, and environment. Place her in a sophisticated intimate music listening room or small boutique recording studio: warm wood details, a tasteful studio monitor speaker, a few softly blurred vinyl records and subtle acoustic panels, clean premium interior, clearly not a house or bedroom. She holds ONE headphone earcup lightly with one hand, as if listening, and gives a soft small warm smile toward a point just beside the camera. Keep the refined, beautiful premium photographic atmosphere and skin finish of the original reference, with gentle flattering natural and warm studio light. Chest-up portrait, face centered horizontally and in upper-middle of frame, full hair/head visible and modest headroom for card/avatar crop; enough background to establish music setting. Realistic hand anatomy. No text, logos, watermark, border or collage.
```
## 3. 하늘 · 카페 테라스

- 방식: built-in imagegen, 기존 사진 참조 편집
- 입력: `/Users/ethan/repository/crefans_front/public/illustrations/redesign/hero-woman.png`
- 저장: `/Users/ethan/repository/crefans_front/public/illustrations/redesign/variety/haneul-courtyard-v3.png`
- 생성 원본: `/Users/ethan/.codex/generated_images/01a0867d-8d5a-70e2-8537-b6a07fad34a2/exec-f51eea0b-64b0-474e-a8f8-5a38c9ca4fa7.png`

실제 프롬프트:

```text
Use case: photorealistic-natural, reference-based photograph variation. Preserve exactly the same fictional ADULT woman in the reference: her youthful adult early-twenties appearance, delicate face shape and features, long dark hair, refined soft makeup, ivory off-shoulder knit styling, premium Korean editorial beauty aesthetic. Do not age her, do not replace her with a different face, do not change hairstyle or clothes. Change only pose and location: she sits on a tasteful small Parisian-style courtyard cafe terrace with pale stone arches, soft greenery, a slim wrought iron chair, morning light. She gently rests her forearms on the table, shoulders relaxed, turns slightly toward the camera with a subtle warm closed-mouth smile. No chin propped in hand. One hand loosely holds the handle of a small ceramic coffee cup on the table. Elegant candid portrait, clean natural skin and realistic fine details, warm restrained editorial color grading like reference. Medium close waist/chest-up composition, landscape 3:2, her face at x66% and y37% with comfortable headroom for both banner and vertical signup crop, calm pale background occupying left40%. Do not show a bedroom, couch or house interior. Single photograph, no text, no logos, no watermark, no UI, no collage.
```


## 4. 하늘 · 아트 북숍

- 방식: built-in imagegen, 기존 사진 참조 편집
- 입력: `/Users/ethan/repository/crefans_front/public/illustrations/redesign/hero-woman.png`
- 저장: `/Users/ethan/repository/crefans_front/public/illustrations/redesign/variety/haneul-bookshop-v3.png`
- 생성 원본: `/Users/ethan/.codex/generated_images/01a0867d-8d5a-70e2-8537-b6a07fad34a2/exec-517ce297-0633-4ee5-837b-483406b3c168.png`

실제 프롬프트:

```text
Use case: photorealistic-natural, reference-based photograph variation. Keep exactly the reference's same fictional ADULT female model: youthful adult early twenties, delicate soft facial proportions and eyes/nose/lips, long dark loose hair, polished premium Korean magazine appearance, subtle makeup, the SAME ivory knit outfit, no aging and no replacement with a different woman. Change ONLY pose and background. She is in a refined independent art bookshop with pale oak shelves, art photo books and soft afternoon window light. Sitting on a simple dark bench, holding an open photography book with both hands at her lap, looking up toward the photographer with a quiet tiny smile and head gently tilted. Eye-level three-quarter medium portrait, landscape 3:2, face centered in upper middle with enough headroom for creator cards. Expensive understated editorial mood, real skin texture, soft warm/neutral grading matching reference. Do not put her in a bedroom or home. One standalone realistic photo, no legible letters in background/book, no text, logo, watermark, UI or collage.
```

## 5. 민지 · 미술관

- 입력: `public/illustrations/redesign/minji.png`
- 저장: `/Users/ethan/repository/crefans_front/public/illustrations/redesign/variety/minji-gallery-v3.png`
- 생성 원본: `/Users/ethan/.codex/generated_images/01a099c1-0264-7262-984e-ddcd18a4cceb/exec-1ed76854-7746-4efb-85e1-ce98751f6ea8.png`
- 카드 위치: `55% 30%`

실제 프롬프트:

```text
Use case: identity-preserve
Asset type: landscape creator profile photograph for a premium social membership platform.
Input image 1 is the edit target and the exact identity reference. Create ONE 3:2 landscape photorealistic image of this SAME adult woman. Preserve her exact delicate face proportions, eye shape, nose, lips, jawline, smooth youthful ADULT early-20s appearance, the same long dark silky hair with soft wispy bangs, subtle refined makeup, and her light ivory knit clothing. Keep the premium polished photographic appearance and quality of the reference. Do not replace her with a different person, age her up, alter her facial proportions, or change her styling.
Change only her pose and location: she is in a quiet bright contemporary art museum with large abstract paintings, pale natural stone architectural surfaces, and soft daylight. This is a gallery, not a house or bedroom. She stands with her body turned gently to the side and naturally turns her face back toward the camera, with a subtle natural closed-mouth smile. Her hand is no longer propping her face. Medium upper-body composition, face in the upper central area with generous headroom, enough museum background for visual variety, suitable for a landscape card and a central circular avatar crop. Keep her recognizable exact identity and young-adult premium model aesthetic from the reference, natural flattering daylight, realistic optical depth of field and skin texture.
No text, no UI, no logos, no watermarks, no collage, no contact sheet.
```

## 6. 예린 · 웰니스 스튜디오

- 입력: `public/illustrations/redesign/yerin.png`
- 저장: `/Users/ethan/repository/crefans_front/public/illustrations/redesign/variety/yerin-wellness-v3.png`
- 생성 원본: `/Users/ethan/.codex/generated_images/01a099b4-d179-72f1-8760-3a802a0d0790/exec-3429d18d-b9ba-4bfb-9232-4059ac7bd049.png`
- 카드 위치: `55% 35%`

실제 프롬프트:

```text
Use case: identity-preserve.
Asset type: premium photorealistic creator profile image for a Korean lifestyle website.
Edit target and identity reference: the supplied yerin.png. Preserve the SAME fictional adult woman from this image: exact youthful adult early-20s appearance, delicate facial proportions, eye shape and spacing, nose, lips, soft jawline, luminous refined complexion, brown eyes, chestnut-dark brown hair in the same loose low updo with wispy face-framing curtain strands, and the same polished premium editorial beauty aesthetic. She is an adult. Do not age her up or redesign her face.
Keep her existing clothing and styling: the same simple white ribbed sleeveless top, the same soft polished makeup and subtly glossy lips. Preserve her natural body proportions. Do not replace her outfit with gym gear, leggings, a sports bra, or a different fashion look.
Change only the location, pose, and necessary camera framing: place her in a sophisticated bright wellness/Pilates studio with large glass windows, soft diffused daylight, elegant neutral materials, and a subtly visible Pilates reformer. She is seated lightly and upright on a studio chair or the edge of an upholstered bench near the reformer, shoulders relaxed, hands resting naturally down near her lap rather than touching her cheek. She looks directly at the camera with a gentle comfortable smile, maintaining the same recognizable face.
Composition: a single 3:2 landscape photo, eye-level upper-body portrait. Her face is horizontally centered and in the upper-central part of the frame, but with generous clear headroom above the complete hair silhouette, roughly 12–15% of frame height. Keep the face large enough for a profile portrait and the shoulders comfortably inside the central square area, suitable for centered circular avatar cropping. Background softly blurred but clearly a refined Pilates/wellness studio.
Quality: realistic high-end natural editorial photography, soft luminous skin with restrained real texture, flattering window light, delicate refined atmosphere consistent with the reference.
Constraints: preserve identity, youthful adult age, hairstyle, top and beauty styling. No bedroom, home interior, bedding, exercise sweat, muscular redesign, older appearance, rough documentary gym aesthetic, text, logos, watermark, collage, or multiple panels.
```
