# 크레팬스 보안·장애 대응 점검

확인일: 2026-10-29 KST. 기준 릴리스: `advertising-20261029`. 판정은 이 시점의 코드·설정·검증 범위에 한정한다.

## 종합 판단

**기본적인 권한 분리, 콩 원장의 중복 방지, 유료 미디어 요청별 인증은 갖춰져 있다. 그러나 계정 변경·결제 예외 처리와 장애 감지·복구에 우선 보완할 부분이 있다.** 기존 회귀가 통과해도 이번에 발견한 경쟁 조건과 공급사 오류 조합까지 안전하다는 뜻은 아니다. 실결제·송금 확대 전 아래 P1을 해소할 것을 권고한다. 현재 침해나 실제 이중 청구가 있었다는 결론은 아니다.

인증·접근제어, 결제·미디어, 장애 대응의 **독립 AI 검토 3개**를 통합하고, 주 담당이 실제 운영 설정·AWS·패키지 점검과 격리 검증을 수행했다. 실제 외부 전문가의 서명된 감사, 공인 인증 또는 전수 침투시험은 아니다.

P1은 우선 보완, P2는 다음 순서 보완이다. 심각도는 영향·현재 활성 상태·성립 조건을 함께 고려한 자체 분류이며 CVSS 점수나 법적 판단이 아니다.

## 1. 먼저 수행한 운영 배포

- 프론트·API/worker·관리자 콘솔을 배포했다. 변경 목록은 front 41/server 8/admin 7파일이다. 운영 상태 기록→직전 소스에 변경분만 반영→amd64 빌드/이미지 소스 대조→직접 스트리밍→환경·DB 백업→마이그레이션→API/worker→admin→front 순서를 사용했다.
- 광고상품 등록·수정·노출/판매 설정·소프트 삭제와 스튜디오 카탈로그/목업을 반영했다. 공통 스낵바, 모바일 이미지 클릭 확대, 후원 동전 아이콘도 포함했다.
- **실제 광고 구매 주문·PG 결제·구매 기간 자동 적용·광고 매출 반영은 미구현이다.** 결제수단과 시작 방식 결정이 남아 실제 구매 버튼은 비활성화했다. 카탈로그 구현을 구매 기능 완료로 보고하지 않는다.
- 운영 실행 소스 front 669/API 211/worker 211개 SHA 일치, 관리자 이미지 빌드/실행 산출물 대조, 마이그레이션 28개 체크섬 일치. DB·proxy 컨테이너 보존, 6개 컨테이너 실행·재시작 0·OOM 없음.
- 운영 페이지 검사 10건과 브라우저 22건 통과(프론트 18/콘솔 4). 콘솔 변경 및 로그인 필요 화면의 일부 검증은 브라우저 API 대역이며 운영 사업 데이터는 수정하지 않았다.
- 이미지 보존 계획을 먼저 보고한 뒤 로컬/운영 각각 서비스별 최근 3개를 유지했다. 강제 삭제·볼륨 삭제 없음. Docker Desktop 종료 명령 0, 이후 backend 프로세스 없음 확인.
- 가이드 소개서의 이미지 프레임 수정은 이번 배포에 포함하지 않았다. 기존 로컬 변경은 그대로 보존했다.

[배포 증거](audit/advertising-deployment-20261029.json). 운영: [스튜디오 목업](https://beta.crefans.com/preview/studio/advertising), [스튜디오 실제 목록](https://beta.crefans.com/service/studio/advertising), [콘솔 상품 관리](https://admin.crefans.com/console/advertising).

## 2. 요구사항별 확인과 한계

| 영역 | 합격 조건 | 관측 결과 |
|---|---|---|
| 운영 배포 | 선택 소스/마이그레이션 일치, 정상 응답, 비대상 보존 | 위 배포 검증 통과 |
| 계정·권한 | 회원/관리자 분리, 타인 작업 거부, 재인증·회수 안전성 | 기본 권한 통과, AUTH-01~05 보완 |
| 돈·미디어 | 원장 한 번 반영, 불명 상태 보존, 요청마다 현재 열람 권한 | 기본 회귀 통과, FIN-01~04 보완 |
| 장애 대처 | 업무 정지 감지, 외부 경보, 다른 위치 복구 | 현재 정상 상태 확인, OPS-01/02 미충족 |
| 운영 증거 | 읽기 전용·민감값 제외·명령/시각/결과 보존 | 원시 증거 `.local/security-review-20261029`, 공개 요약 JSON |

검토 시 토스 키는 **test**, `BETA_MODE=true`, 실은행 지급·광고 메일·미디어 자동 삭제는 비활성이다. PASS/계좌 공급사 어댑터는 미설정이다. 이메일 기반 가입이 PASS 또는 성인 본인확인을 대신한다는 판정은 하지 않는다. 보호 플래그를 변경하지 않았다.

## 3. 우선 보완: P1

### DEP-01. 지원 종료 프론트와 보안 패치 지연

- 운영 프론트 Next.js **14.2.28** 확인. [공식 지원표](https://nextjs.org/support-policy)에서 14는 지원 종료이며 15/16이 지원 대상이다(2026-10-29 확인). 버전 올림 자체보다 지원되는 버전과 관련 의존성을 함께 검증해야 한다.
- `npm audit --omit=dev --json --ignore-scripts`: front 7개 패키지 항목(critical 2/high 4/moderate 1), server 25개(high 15/moderate 8/low 2), admin/guide 0개. 이는 패키지별 경고 수다. 실제 공격 가능한 취약점 수나 피해 건수가 아니다. dev 의존성은 제외했다.
- Next의 [RSC 서비스 거부](https://github.com/vercel/next.js/security/advisories/GHSA-mwv6-3258-q52c), [이미지 캐시 디스크 소진](https://github.com/vercel/next.js/security/advisories/GHSA-3x4c-7xq6-9pq8) 등을 공식 공지와 대조했다. 실제 공격은 실행하지 않았다. Linux에서 Windows 전용 RCE를 적용하지 않았고, API/admin의 sharp 0.35.5 및 프론트 sharp 미해결 상태를 확인했으므로 감사 경고만으로 이미지 RCE 가능을 확정하지 않는다.
- 조치/합격: 지원 버전으로 갱신하고 해당 요청 경로·이미지 처리·결제/인증·목업/서비스 공유 UI 회귀를 확인한다. 이미지 요청의 메모리·디스크 예산도 격리 부하로 검사한다. 이번 점검에서 패키지를 변경하지 않았다.

### AUTH-01. 이메일 변경에 기존 인증 수단의 재인증이 없음

- [이메일 변경](../../crefans_server/src/platform/email-change.service.ts:12)은 유효 세션과 **새 이메일의 코드**만으로 복구 주소를 바꾼다. 현재 비밀번호 또는 기존 주소 확인이 없다. 세션 회수는 변경 후 수행된다.
- 메모리 대역에서 비밀번호/기존 주소 확인 없이 변경됨과 틀린 코드 거절을 재현했다. 유효 세션 탈취를 전제로 복구 이메일까지 바꿔 지속적인 계정 탈취로 이어질 가능성이다. 최초 세션 탈취나 실제 운영 악용은 입증하지 않았다.
- 조치/합격: 현재 인증 수단으로 재인증하고 회원·새 주소에 묶인 일회용 확인을 요구한다. 정상 흐름만 성공하고 세션만 가진 요청·만료/재사용 증명은 거부되어야 한다. [OWASP 민감 기능 재인증 및 이메일 변경](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#changing-a-users-registered-email-address)을 적용한 권고다.

### AUTH-02. 비밀번호 변경 직후 진행 중이던 로그인이 새 세션을 만들 수 있음

- [로그인/발급](../../crefans_server/src/auth/local/local-member.service.ts:88)은 해시 검증과 세션 생성이 분리돼 있고 [재설정](../../crefans_server/src/auth/local/local-member.service.ts:203)의 세션 회수와 공통 잠금/인증 버전이 없다.
- 실제 비밀번호 함수와 로그인 소스, 메모리 저장소/장벽으로 **옛 비밀번호 검증→비밀번호 변경 및 회수 완료→세션 생성** 순서의 유효 세션을 확인했다. 실제 MySQL 경쟁 재현은 미실행이다.
- 조치/합격: 발급·변경·회수를 회원별 트랜잭션/인증 버전으로 결합한다. 결정적 장벽을 둔 DB 시험에서 회수 뒤 구 자격으로 생성한 세션이 인증될 수 없어야 한다. 정상 로그인/갱신을 함께 대조한다. [OWASP 세션 관리](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) 기준이며 시간 정책은 별도 결정한다.

### FIN-01. 조회 제한을 결제 실패로 처리해 새 청구로 이어질 수 있음

- [공급사 오류 분류](../../crefans_server/src/platform/payment-provider.ts:21)는 토스 조회의 `403 FORBIDDEN_CONSECUTIVE_REQUEST`를 `PAYMENT_FAILED`로 변환한다. [결제 복구](../../crefans_server/src/platform/finance.service.ts:94)는 주문을 failed로 바꿀 수 있고 재시도 때 새 주문번호/멱등키를 만든다.
- 메모리 대역에서 조회 제한→failed→재시도→새 청구 ID를 확인했다. **첫 승인 응답을 잃은 상황이라면 중복 청구 위험**이다. 실제 청구는 하지 않았다. `ALREADY_CANCELED_PAYMENT`도 같은 실패로 분류돼 취소 경합 시 내부 상태가 되돌아갈 가능성이 있다(경합 전체는 코드 추론).
- [토스 공식 오류표](https://docs.tosspayments.com/reference/error-codes)에서 해당 403은 조회 제한이지 승인 실패의 증명이 아니다. [멱등키 계약](https://docs.tosspayments.com/reference/using-api/authorization)에 맞춰 조회 오류는 원래 주문/키와 불명 상태를 유지해야 한다.
- 조치/합격: 승인 성공→응답 유실→조회 제한→회복 DONE에서 새 청구 0회, 매출/구독 1회 반영. 조회 401/403/404/429/5xx 및 이미 취소됨을 작업 종류별로 검사한다. 확정된 결제 거절은 별도 처리한다.

### FIN-04. 외부에서 취소한 멤버십 결제의 자동 대사 경로가 없음

- [배치](../../crefans_server/src/platform/jobs.service.ts:33)는 processing/refunding을 조회하지만 paid 멤버십의 외부 취소는 주기 대사하지 않는다. 콩 웹훅은 beanCharge 전용이다. 권한/매출은 로컬 구독·결제 상태에 의존한다.
- PG 관리자 등 외부 절차에서 승인 결제를 취소하면 내부 열람·미지급 수익이 남을 수 있다는 코드 판단이다. 실제 외부 취소 사례·차지백 계약·운영 수동 대사 여부는 미검증이며 현재 실결제는 비활성 범위다.
- 조치/합격: 공급사 인증 재조회로 전액 취소를 검증하고 중복/지연/유실 이벤트에도 권한·원장이 한 번만 정정되게 한다. 주기 대사로 웹훅 유실을 보완한다. 부분취소·분쟁·기지급 회수 정책은 별도로 정한다. [토스 웹훅 가이드](https://docs.tosspayments.com/guides/v2/webhook)를 확인했으며 이벤트 본문만 신뢰하는 설계는 권장하지 않는다.

### OPS-01. 같은 서버의 백업에 의존하며 실제 복원이 증명되지 않음

- 이번 운영 조회에서 배포 시 DB dump **10개가 모두 같은 EC2/EBS**에 있다. 해당 볼륨 snapshot 0, 해당 리전 AWS Backup 계획/DLM 정책 0. 루트 EBS는 인스턴스 종료 시 삭제 설정이다. 다른 계정/외부 개인 보관 전체까지 조사한 것은 아니다.
- 배포 전 환경·DB 백업, 이미지 최근 3개 보존은 있다. 하지만 볼륨 소실에는 같은 위치 dump가 함께 사라질 수 있다. 이번 dump 존재·SHA 확인은 복원 성공 증거가 아니다.
- 배포 rollback은 환경을 복원하고 이전 컨테이너 시작을 시도하지만 복원 후 준비/업무 검증이 없고 재기동 실패를 별도 분류하지 않는다. 원래 배포 실패 코드는 유지된다. 역 migration은 하지 않는다.
- 조치/합격: 별도 실패 영역의 암호화 백업과 필요한 키/설정 복구본, 주기·실패 알림을 마련한다. 새 격리 환경에 복원해 원장 합계/참조/미디어/권한/암호화값을 검증하고 소요·손실 범위를 측정한다. [AWS 복원 검증 지침](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_backing_up_data_periodic_recovery_testing_data.html)에 따라 **RPO/RTO는 아직 검증된 수치가 없다**. 비용·보유기간·허용 손실은 사업자 결정이다.

### OPS-02. worker 지연 감시가 꺼져 있고 서버 밖 감시가 확인되지 않음

- 실제 `OPERATIONS_WATCHDOG_ENABLED` unset. [시작 함수](../../crefans_server/src/platform/operations.service.ts:46)는 true일 때만 감시한다. 현재 heartbeat·DB health 정상과 watchdog 활성은 별개다.
- 앱 컨테이너 healthcheck가 없고 DB만 있다. 재시작 정책은 종료에는 도움이 되지만 살아 있는 프로세스의 업무 정체를 복구하지 않는다. 확인한 AWS/호스트 범위의 관련 CloudWatch alarm·외부 감시 스케줄은 0개다.
- Telegram/DB outbox가 같은 호스트·DB에 의존한다. worker 중단, DB·EC2 장애, Telegram 장애가 생기면 자동 보고가 안 되거나 늦어질 수 있다. 일반 알림과 경보도 같은 전송 큐다. 수집 시 미전송은 0, 최근 전달 기록은 있었으나 이번에 실제 수신자 화면을 확인하거나 메일/Telegram을 보내지는 않았다.
- 조치/합격: worker heartbeat, 작업별 마지막 성공, 오래된 미확정 결제/미전송 연령 감시를 활성화하고 서버 밖 uptime/자원 경보 및 보조 연락 경로를 갖춘다. 격리 worker 중단·전송 429/timeout·큐 적체 주입으로 감지/통보/복구 시간을 측정한다. [AWS 상태 감시 지침](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_withstand_component_failures_monitoring_health.html), [Docker 재시작 정책](https://docs.docker.com/engine/containers/start-containers-automatically/)을 구분해 적용한다.

## 4. 후속 보완: P2

| ID | 확인한 사실·조건 | 필요한 조치·합격 기준 |
|---|---|---|
| AUTH-03 관리자 출처 | [main.ts:17](../../crefans_server/src/platform/main.ts:17)의 Origin 필수 검사는 회원 쿠키 2종만 포함. 운영 허용 목록은 팬·콘솔 주소 공용. 관리자 쿠키는 host-only/HttpOnly/SameSite=Strict로 보호됨. 대역에서 관리자 쿠키+Origin 없음 통과, 외부 Origin 거절 | 관리자 출처를 분리하고 관리자 access/refresh에도 누락 출처 검사. 실제 bootstrap·형제 도메인 브라우저 대조. 일반 외부 CSRF 성공을 확정한 것은 아님 |
| AUTH-04 비밀번호 계약 | 재설정은 256자·공백 보존, [로그인](../../crefans_server/src/platform/auth.service.ts:64)은 128자·trim. 129자/앞뒤 공백의 설정 후 로그인 불일치 재현. 관리자도 trim 불일치 가능 | 가입/로그인/변경/복구의 공통 비밀번호 계약. 경계·Unicode·공백 시험, 저장과 세션 삭제 전에 잘못된 입력 거부 |
| AUTH-05 관리자 세션 | [refresh](../../crefans_server/src/platform/admin-auth.ts:55)가 원래 인증 시각 없이 새 7일 만료를 발급. 회수/비활성화는 가능 | 최초 인증 기준 절대 만료 유지, 민감 작업 재인증/MFA 검토. 정확한 시간 정책 결정 후 가짜 시계 반복 갱신 시험 |
| FIN-02 복구 큐 격리 | [콩 tick](../../crefans_server/src/platform/beans.service.ts:151) 첫 실패로 나머지 대사·출금에 도달 못함을 메모리 재현. 일반 refunding50/payout20에도 공정한 재선택 보장 부족 | 항목별 오류 격리·다음 시도 시각·수동 조치 상태. 실패1+정상 후속 건, 51환불/21출금 경계·동시 worker에서 진전 확인. 불명 청구를 새 결제로 바꾸지 않기 |
| FIN-03 PIN 승인 회수 | [PIN 재설정](../../crefans_server/src/platform/finance.service.ts:153)은 일반 출금 승인만 삭제, 콩 승인표는 남음. 120초 이내 유효 세션·같은 계좌/수량 조건에서 기존 승인 사용 가능성 | 같은 트랜잭션에서 두 승인표 회수 또는 PIN 버전 검사. 변경과 출금 신청의 결정적 경합 시험. 임의 계좌 송금이 가능하다는 뜻은 아님 |
| OPS-03 광고 메일 정체 | [전송 큐](../../crefans_server/src/platform/marketing.service.ts:43)의 오래된 캠페인30개가 뒤의 동의 안내를 기다리면 서로 진행 못할 수 있음. 코드 추론, 현재 발송 off | 안내 우선순위/보류 상태·재시도 시각, 29/30개 경계와 SMTP 결과불명 시험 |
| OPS-04 로그 보관·보존 | 실제 `AUDIT_RETENTION_DAYS` unset→요청 외 감사 자동 삭제 보류. access unset→7일 지난 행 삭제 대상으로 선택, 전체 정리는 tick당1000행. 외부 감사 export 미설정, Crefans CloudWatch log group0, CloudTrail trail0 | 보유정책 결정, 만료 행 연령·용량·삭제 처리량 감시, 외부 접근통제된 증거 보관. CloudTrail trail0은 기본 Event history까지 없다는 뜻이 아님. 비밀값 마스킹과 IP 개인정보 보유는 별개 |
| INF-01 미디어 삭제 복구 | S3 공개 차단·암호화/OAC는 있으나 versioning 미설정. EC2 역할은 지정 미디어 prefix Get/Put/Delete 권한 | 버전관리·수명주기/권한 분리 비용 검토, 삭제/덮어쓰기 복원 리허설. 현재 자동 삭제는 off지만 자격 침해/수동 삭제 복구 수단은 별도 필요 |
| WEB-01 브라우저 방어 | 확인한 페이지에 HSTS 없음. 팬 페이지에 frame 차단/CSP 없음. 콘솔/가이드/명함은 X-Frame-Options DENY. 정상 HTTPS는 사용 | 결제 SDK·외부 콘텐츠와 호환되는 CSP를 점진 적용하고 frame-ancestors/HSTS 검증. 실제 clickjacking/XSS 성공은 미실행 |
| INF-02 공격 방어 범위 | CloudFront WAF 연결은 있으나 Rules=[]/기본 Allow. [플랫폼 탐지](../../crefans_server/src/platform/security.service.ts:13)는 일부 query key 패턴·첫 탐지403,10분 내2회24시간 IP 차단. body/일반 검색/모든 페이지를 포괄하지 않음 | 애플리케이션 매개변수 바인딩/권한을 근본 방어로 유지하고 필요한 rate rule·탐지 범위·오탐 해제를 검증. 영구 차단/첫 시도 전체 차단은 현재 크레팬스 정책이 아님. 다른 서비스의 차단 정책과 혼동하지 않기 |

추가 근거(2026-10-29 확인): [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [비밀번호 복구](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [거래 승인](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html), [기록 관리](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), [HTTP 헤더](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html), [SQLi 방지](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html), [AWS 큐 적체](https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/). 이 자료로 사업자의 보유기간·수수료·세션 시간을 임의 확정하지 않았다.

## 5. 확인된 방어와 장애별 대처 현황

- 회원·콘솔 계정/세션·쿠키 분리, 업무 API 43개의 가드/권한 선언, 임시 비밀번호 변경 강제. 권한 표기 제거 대조는 실패했다. 호환용 `permissions=null`은 기존 역할 권한을 유지하며 모든 null이 권한 없음인 것은 아니다.
- 원장 합계 0·잔액 음수 차단·요청별 중복 방지·지갑/회원 행 잠금·계좌 version/수량에 묶인 승인·결과불명 보존 구조. FIN-01은 기본 구조의 특정 예외 오류 분류 문제다.
- 구독 snapshot 등급/기간·환불 상태 검사, 소유자 예외, 미디어의 GET/HEAD/Range마다 현재 권한 검사. CDN viewer-request 인증 후 캐시 사용, 권한 서버 오류는 거부한다. 이번 AWS 조회에서 연결 함수와 비공개 S3 경로를 확인했다. 인증 후 이미 내려받은 파일 회수나 진행 중 전송 중단까지 보장하는 구조는 아니다.
- DB/API 앱 포트 외부 비공개, SSH는 기존 승인된 두 /32만 허용, 비밀번호/루트 SSH 로그인 off, IMDSv2 필수, EBS 암호화. 승인된 SSH 규칙은 변경하지 않았다.
- Telegram 재시도·중복 억제·전송 lease·429 backoff, business 변경과 감사/outbox를 같은 트랜잭션에 저장, 허용 필드 마스킹이 있다. Telegram 접수 후 DB 표시 전에 중단되면 알림 중복 가능성은 남는다.

| 장애/사고 | 현재 자동 대처 | 남은 공백 |
|---|---|---|
| 앱 프로세스 종료 | 컨테이너 재시작·오류 outbox 시도 | 살아 있는 정체·업무 준비 확인 없음 |
| worker 정지 | heartbeat 저장 코드는 있음 | watchdog off, 독립 경보 없음 |
| DB/EC2 전체 장애 | API 대체로503/권한 확인 실패 거부 | 같은 DB의 알림도 영향, 같은 EBS 백업, 복원 시간 미측정 |
| PG 응답 유실/외부 취소 | 기존 ID 조회·lease·processing/refunding 복구 | FIN-01 분류 및 paid 외부 취소 대사 |
| 후원/출금 한 건 실패 | 원장 예약·동일 요청 ID·전체 job 오류 기록 | 항목별 후속 진행 FIN-02 |
| Telegram 장애/적체 | 재시도/backoff/기록 | 독립 전송 실패 경보·보조 채널 없음 |
| 미디어 삭제·덮어쓰기 | 비공개 S3·참조 확인·삭제 기본 off | 객체 이전 버전 복원 없음 |
| 계정 탈취 의심 | 비밀번호 변경·세션 삭제·운영자 권한 회수 | 이메일 재인증/진행 중 로그인 회수 경합 |
| 배포 실패 | 이전 환경/이미지 재기동 시도·추가 schema 보존 | rollback 후 업무 인수시험·복원 실패 별도 보고 미완성 |

단일 EC2·단일 가용영역이다. 이 점검에서 HA 전환이나 추가 유료 서비스를 만들지 않았다. 소규모 베타에서는 **패치·계정/금융 수정→외부 백업과 복원→독립 감시→장애 주입 시험**이 우선이며, 다중 서버 전환은 측정한 부하와 복구 목표에 따라 정할 수 있다. 최근 CPU/credit 상태가 양호했다는 사실은 목표 동시접속 성능 검증이 아니다.

## 6. 실제 실행한 검증

| 검증 | 환경/결과 | 한계 |
|---|---|---|
| 서버 build | CREFANS_E2E=true, 종료0 | 실행 안전성 전체 보장 아님 |
| 보안/관리자/광고/금융/콩/미디어/운영 이벤트/감사 export/감시/로그 검사 12파일 | Homebrew MySQL 격리 E2E DB·메모리 및 공급사 대역, **100통과/1건너뜀/0실패**, 종료0 | 선택 실행 실제 IP row-lock 추가시험은 전용 환경변수 미설정으로 skip. 실제 공급사 아님 |
| 인증 신규 재현 | 실제 함수+메모리 저장소 6묶음, 주 담당 재실행0 | 위험 경로가 재현됐다는 뜻. 수정 완료/제품 합격이 아님 |
| 금융·미디어 신규 재현 | 오류 분류·후속 작업 중단·PIN 회수·GET/HEAD/Range/권한 오류 대역, 주 담당 재실행0 | 실제 청구·은행·CDN 종단 악용/장애 없음 |
| 업무 권한 선언 대조 | 43경로 누락0, 메모리 Permit 삭제 대조는 누락1 탐지 | 전 API의 동적 권한 전수시험 아님 |
| 공개 HTTPS 읽기 | 9/9 예상 응답, 설정파일404·익명 관리자401·화면200 | 악성 입력·운영 로그인·실제 쓰기 미실행 |
| 의존성 감사 | 네 저장소 production dependency 검사 | front/server 경고로 종료1, admin/guide 종료0. package 경고와 실제 도달 가능성 구분 |
| AWS/호스트/DB 읽기 | AWS 조회·컨테이너/설정·집계·마이그레이션 대조 종료0 | 조회한 계정/리전/리소스 범위. 운영 개인정보 행 본문·비밀값 미수집 |

명령·시각·종료 코드·원본 로그 해시·HEAD/dirty·중요 소스 해시는 [검증 요약](audit/security-review-20261029.json)에 기록했다. 상세 재현/전문 검토/원시 AWS 결과는 `.local/security-review-20261029`에 보존한다. 검토 원본 사본의 해시 비교 948개와 장애 검토 텍스트 767개는 범위가 다르며 더하거나 전수 보안 검토 건수로 쓰지 않는다.

초기 감사 보관 조회는 사용되지 않는 `AUDIT_LOG_RETENTION_DAYS`를 조사했다. 후속으로 실제 `AUDIT_RETENTION_DAYS`를 조회해 unset과 기본 자동 삭제 보류를 확인했다. 초기 관리자 브라우저 실행의 Playwright 모듈 충돌은 올바른 콘솔 실행기로 수정 후4개 통과했다. 대역 재현의 누락 fixture/구문 문제는 보완 후 재실행했으며 제품 결함 수에 포함하지 않았다.

## 7. 다음 작업의 인수 조건과 미검증

1. 계정·금융 P1 수정 후 이번에 발견한 실패 경로를 회귀에 추가한다. 성공 경로만 늘리지 않는다. 사용자 정책 변경이 필요한 항목과 기술 결함 수정을 분리한다.
2. 외부 백업의 성공/실패 경보와 격리 복원 리허설을 완료한다. 허용 데이터 손실(RPO), 복구시간(RTO), 보유기간·비용은 아직 확정/실측하지 않았다.
3. worker·미확정 금융·미전송 지연·디스크·DB·웹을 서버 밖에서 감시하고 담당자·비상 연락·격리/회수·PG 대사·복구 후 재개 순서를 운영 절차로 정한다.
4. DB 단절/용량 부족, worker kill/hang, 공급사 지연/중복/순서 역전, 복원/rollback 실패를 격리 환경에서 시험한다. 운영 장애 주입·실제 송금·메일/Telegram 발송은 별도 승인 범위다.

이번에는 **새로 발견한 취약 경로를 수정하거나 운영 보안/금융 설정을 변경하지 않았다.** 침해 흔적 포렌식, 전체 SQL sink/모든 IDOR/XSS 전수, 실기기 전체, 실제 계좌/PG/메일 수신, 부하 한계, 전체 Git 이력 비밀 검사, 운영 비밀번호 로그인, 손상 백업의 실제 복원은 미실행이다. 현재 추적 파일의 비밀파일 이름/개인키 마커 대조는 전체 비밀 스캔을 대체하지 않는다.

현재 운영 관측과 과거 테스트를 근거로 “해킹 불가”, “장애 없음”, “상용 출시 보장”으로 확대하지 않는다. 이번 결과는 수정 우선순위와 다음 검증의 기준이다.

## 8. 조치 결과 (2026-10-29, 운영 반영 security-20261029)

사용자 지시 "모두 대응, 서비스 로직에 문제 없게"에 따라 코드로 해결할 수 있는 항목은 수정했고, 비용이 드는 AWS 설정은 결정대로 절차·스크립트만 준비했다. 운영 반영: 2026-10-29 `security-20261029`(API/worker·프론트, 콘솔 이미지 유지). 운영 증거: [배포 기록](audit/security-deployment-20261029.json). AWS 설정은 적용하지 않았다. 배포 중 WAF를 조회해 보니 CloudFront Web ACL은 규칙 0·기본 허용이었고, 콘솔·가이드·원본 도메인은 WAF를 거치지 않았다.

| ID | 조치 | 검증 |
|---|---|---|
| DEP-01 | front Next 15 업그레이드(별도 기록 참조). server audit 경고 25→8: Nest 10 최신 패치, express 4.22.3·body-parser·qs·multer·nodemailer 갱신. 남은 8개는 Nest 11이 필요하며, 해당 기능(SSE, TCP microservice, FileTypeValidator)과 uuid v3/v5 버퍼 인자를 쓰지 않는다 | `npm audit` 전후, 서버 build·회귀 |
| AUTH-01 | 이메일 변경 요청에 현재 비밀번호 재확인(회원별 10분 5회), 프론트 설정 화면 입력 추가 | 세션만·틀린 비밀번호 요청 거부, 정상 흐름 통과 |
| AUTH-02 | 세션 생성 시 회원(운영자) 행을 잠그고 검증한 해시와 같을 때만 발급 | 결정적 경합 재현 거부. 수정 전 빌드로 되돌리면 실패하는 대조 확인 |
| AUTH-03 | `ADMIN_ORIGINS` 분리, 콘솔 경로·관리자 쿠키에 Origin 필수, 콘솔 도메인에서 회원 auth 경로 제거 | 출처 조합 8개 단위 시험, Caddy validate |
| AUTH-04 | 설정 공통 계약 8~128자·앞뒤 공백 거부, 로그인은 이전 저장값 호환 | 경계·공백·256자 기존값, 잘못된 재설정이 코드 소모 안 함 |
| AUTH-05 | 콘솔 세션 절대 12시간·유휴 1시간·갱신 시 연장 없음(사업자 결정) | 갱신 후 만료 유지·유휴 만료 후 갱신 거부 |
| FIN-01 | 조회 오류·이미 취소됨을 결과 불명으로 분류. 원래 주문·키 유지 | 응답 유실→조회 제한→회복에서 청구 1회·매출 1회. 카드사 거절은 여전히 실패. 수정 전 빌드에서 실패 확인 |
| FIN-02 | 콩 대사·출금 항목별 격리, 환불·출금 배치 순환 | 실패 1건 뒤 후속 건 진행 |
| FIN-03 | PIN 재설정 트랜잭션에서 콩 출금 승인도 회수(같은 크리에이터 행 잠금) | 수정 전 빌드에서 실패 확인 |
| FIN-04 | 결제 후 120일 이내 멤버십을 분당 10건 공급사 재조회. 전액 취소는 환불과 같은 경로로 1회 정정, 부분취소는 운영 알림 | 반복 실행 1회 정정, 부분취소 미변경+알림. 부분취소·차지백·기지급 회수 정책은 미결정 |
| OPS-01 | 외부 리전 백업 스크립트·복원 리허설 스크립트·절차 준비(`crefans_server/infra/platform/resilience-runbook.md`) | 로컬 dev 덤프 복원 통과, 깨진 덤프·해시 불일치 실패. 운영 백업·AWS 미적용, RPO/RTO 실측 없음 |
| OPS-02 | watchdog 확장·운영 값 true, worker 15분 정체 시 재시작, API healthcheck. 서버 밖 경보는 절차만 | 경보 6종·1시간 중복 억제 단위 시험 |
| OPS-03 | 동의 안내를 캠페인보다 먼저 발송 | 같은 배치에서 안내→캠페인 순서 |
| OPS-04 | 감사·운영자 요청 기록 730일 보관 후 삭제(730 미만 거부), 회원 요청 기록 7일 | 보관 조건 단위 시험. CloudTrail·외부 보관은 절차만 |
| INF-01·INF-02 | S3 버전관리·WAF COUNT 규칙 절차만 | AWS 미적용 |
| WEB-01 | HSTS(1년), frame-ancestors(서비스 self, 콘솔·가이드·명함 none). script CSP는 결제 SDK 시험 후로 보류 | Caddy validate·변환 설정 확인 |

남은 결정과 작업:
- AWS 적용 승인과 비용·백업 리전·보관기간.
- 부분취소·차지백 처리 정책.
- server Nest 11 업그레이드.
- 이번 조치와 무관한 기존 테스트 기대값 2건(10-28 운영자 분리 이후 갱신되지 않음).
