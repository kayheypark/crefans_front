# 문서 현행화 검증

확인일: 2026-10-08. 대상은 `crefans_front`와 `crefans_server` 작업 트리의 Git 추적 파일 및 ignore되지 않은 미추적 `.md/.mdx/.rst/.txt` 전부다. 의존성·ignored 실행 결과·개인 Downloads·다른 프로젝트는 제외한다. 계층도 원문은 변경하지 않고 원래 SHA-256을 검증한다.

## 증명 범위

1. **전수 목록**: [manifest.json](./audit/manifest.json)이 모든 대상 파일에 상태·검토 내용·근거 경로를 지정한다. 새 문서/누락 파일/근거 경로가 없으면 실패한다. 과거 설계·생성 프롬프트를 현재 구현 설명으로 바꾸지 않는다.
2. **계약 대조**: 등록된 Nest controller의 HTTP decorator와 화면 카탈로그를 TypeScript AST로 추출한다. 전체 API가 의미 설명 표와 일치하는지, 모든 카탈로그 URL이 화면 문서에 있는지 검사한다. [전체 코드 계약](../../crefans_server/docs/current-contracts.md)은 모든 라우트·화면·Prisma 원문·migration 파일·환경 템플릿 키·npm 명령을 포함하고 코드로 재생성한 결과와 바이트 단위로 비교한다.
3. **참조와 갱신 탐지**: inline Markdown 로컬 링크/이미지의 파일 존재를 검사한다. 모든 문서·대상 소스·공통 지침·manifest의 SHA-256을 [evidence.json](./audit/evidence.json)에 보존하고 변경 시 만료로 실패한다. HEAD가 같아도 미커밋 파일 해시로 구별한다.
4. **검사기의 대조 검사**: 잘못된 링크·신규 문서·변경된 소스/문서·추가 API를 주입하면 실패하는지 검사한다. 유효 링크는 통과한다. 단순 성공 스냅샷 저장을 제품 동작의 증명으로 사용하지 않는다.
5. **실행 증거**: `docs:prove`는 front check, backend build, domain/HTTP 검사, Playwright를 실제 실행하고 시작/종료 시각·명령·종료 코드·결과 요약·출력 해시를 기록한다. 검사 전후 파일이 변하면 저장하지 않는다. 로그 전문·비밀값은 증거에 공개하지 않는다. 공급사 대역과 격리 DB 검사이며 실금융/운영 검증은 아니다.

자연어의 모든 문장이 모든 상황에서 참임을 자동 증명하지는 못한다. 수동 검토 결과와 자동 계약 검사를 구분한다. 현재 API 문서는 코드 의미·테스트와 대조했고, 과거 문서는 당시 기록으로 명확히 분류했다. 단순 문서 수·해시 일치는 내용이 옳다는 증거가 아니며 아래 검사와 함께 사용한다.

## 반복 명령

Python 3와 프론트 npm 의존성이 필요하다. 형제 백엔드가 다른 위치면 `CREFANS_SERVER_DIR`에 절대 경로를 지정한다. 공통 지침 검사 대상은 이 작업 호스트의 `/Users/ethan/AGENTS.md`와 `/Users/ethan/.codex/AGENTS.md`다. 다른 호스트로 옮길 때는 해당 지침 경로 계약부터 명시적으로 변경한다.

```sh
npm run check:docs       # 파일 누락·계약·링크·기존 증거 만료 검사; 읽기 전용
npm run test:docs        # 잘못된 입력을 탐지하는 대조 검사
npm run docs:contracts  # 코드 계약 문서만 재생성; 의미 설명을 검토한 뒤 사용
npm run docs:record     # 문서 검토 후 해시 스냅샷만 저장; 테스트 통과 주장 불가
npm run docs:prove      # 실제 전체 로컬 검사 후 실행 증거와 해시 저장
```

새 문서는 manifest에 분류와 근거를 추가한다. 변경된 구현/설명을 먼저 검토하고 계약·문서를 수정한 뒤 기록한다. 검사 실패를 피하려고 무조건 `docs:record`를 실행하지 않는다. 스냅샷 저장만 한 결과는 `snapshot-only-not-test-proof`라고 표시한다. `docs:prove` 준비 조건은 [E2E 안내](./service-api-binding.md)를 따른다. 기존 실행 API3001과 격리 DB3307이 필요하며 운영 환경에서 실행하지 않는다.

## 이번에 수정한 불일치

- 비어 있던 front README와 구형 runtime을 실행하던 backend 시작 안내를 신규 `/service`·`/api/v1` 기준으로 정리했다.
- API 래퍼의 “임시 계약”, API 연결/비밀번호 재설정 미완료라는 현재 안내를 수정했다.
- 구형 Cognito·콩·개별 구매·Lambda·오래된 비용/완료율은 과거 범위 표시를 붙이고 현재 기준으로 연결했다.
- 멤버십 버전·출금 PIN/PASS proof·19시 media worker의 실제 구현과 이상 설계/운영 미완료를 구분했다.
- 화면 카탈로그 41개, 프로필 flush 여백 예외, 저장/좋아요 탭 여백, 홈 제목 숨김을 현재 CSS/셸에 맞췄다.
- API 관리자 표의 GET/POST 조합을 정확한 개별 라우트로 분리하고 identity 호환·checkout retry를 명시했다.
- DB의 일부 구형 발췌를 전체 스키마로 오인하지 않도록 현재 Prisma 전체 원문을 자동 대조한다.
- 과거 테스트 수는 당시 결과로 보존한다. 최신 수는 이번 실행 증거에서 확인하며 출시 97개 시나리오 전체 통과로 확대하지 않는다.
- 공통 지침 두 곳과 리포 지침 두 곳에 완료 주장에 필요한 증거·유효성 재검사 규칙을 추가했다.

## 남아 있는 검증 경계

외부 링크의 생존/현행 법령·공급사 계약 재확인, Markdown heading anchor와 reference-style 링크, 백틱 안의 모든 과거 경로, 이미지 생성 원본의 개인 파일 보존, 운영 DB와 migration 실제 일치, 모든 화면의 픽셀/상호작용, PASS/은행 공식 bridge·SMTP/Toss 실연동, 운영 TLS·부하·백업 복구는 이 문서 검사로 증명하지 않는다. 운영 전 미결정 정책과 미실행 시나리오는 [출시 검수](./release-test-scenarios.md)에 남긴다.

근거 확인일 2026-10-08: [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)는 요청·화면·소스의 실패 증거를 추적할 수 있어 기존 E2E의 `retain-on-failure`를 유지한다. [OWASP 권한 회귀 자동화](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Testing_Automation_Cheat_Sheet.html)를 근거로 역할/소유권 검사와 문서 목록의 일치만으로 보안 전체를 증명했다고 주장하지 않는다.
