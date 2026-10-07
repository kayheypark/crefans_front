# 크리에이터 이미지 장소·포즈 변형

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
