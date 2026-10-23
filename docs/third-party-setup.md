# 크레팬스 외부 서비스 연결 실행 안내

확인일: 2026-10-09. 현재 신규 `/service` 및 `/api/v1` 코드 기준이다. 목업 `/preview`는 그대로 유지한다. **지금 먼저 할 일은 토스 테스트 키 확보, PASS 도입 상담, 토스 지급대행 적합성 상담이다.** 실제 계약·요금·콘텐츠 취급 승인까지 공개 개발 문서만으로 확정할 수는 없다.

이 문서는 준비 절차다. 공급사 신청·계약 체결·유료 리소스 생성·키 변경·실결제·송금은 이번 작업에서 실행하지 않았다. 공식 자료에 확인된 사실, 프로젝트의 선택 제안, 공급사에 확인할 사항을 구분한다. 모든 출처의 확인일은 위 날짜이며 계약 시 최신 조건을 다시 확인한다.

## 진행 순서와 사용자 역할

| 순서 | 준비할 서비스 | 직접 도와주실 부분 | 제가 이어서 할 작업 | 현재 경계 |
| --- | --- | --- | --- | --- |
| 1 | 토스 카드 자동결제 | 사업자 계정 로그인, 같은 테스트 상점의 키 저장, 빌링 계약 신청과 사업 내용 확인 | 실제 테스트 결제창·등록·결제·갱신·취소 대조 | REST/SDK 구현, 실공급자 미검증 |
| 2 | NICE 또는 KCB 휴대폰 본인확인 | 업체 선택, 사업자 상담·계약, 휴대폰 인증, 공식 연동자료 확보 | 계약 상품 전용 어댑터 구현, 가입·출금 PIN 인증 검증 | 내부 어댑터만 있음 |
| 3 | 토스 지급대행 우선 상담 | 플랫폼 매출 구조·개인 크리에이터 지급 가능 여부·비용 확인, 계약/KYC | 셀러·지급 상태·암호화·결과 통지 연동 | 현재 은행 어댑터와 다른 개발 필요 |
| 4 | 기존 AWS와 도메인 | 계정 로그인/MFA, 월예산·리전·서비스 주소 결정, 과금 승인 | 서버·HTTPS·백업·모니터링 구성 | 배포 파일 있음, 운영 검증 별도 |
| 5 | 이메일 전달성 | Gmail 계정 접근, DNS 소유 확인, 수신함 확인 | Postmaster 진단, 필요 시 SES 비교 연동 | SMTP 발송 가능, Gmail 스팸 미해결 |
| 6 | 미디어 저장소와 CDN | AWS 사용·비용 승인, 보관/삭제 정책 결정 | 비공개 S3·세션별 접근·업로드 전환 | S3 저장/API 스트리밍, 공유 링크 우회 차단; 최신 미디어 증거 참조 |

1~3의 상담은 병행한다. 공개 HTTPS 시험 환경을 준비한 뒤 PASS·지급 결과 통지를 연결한다. 결제 테스트 키 확보는 운영 배포를 기다리지 않아도 된다.

## 공통 준비 자료

다음은 상담 준비용 목록이며 모든 업체가 동일 서류를 의무 요구한다는 뜻은 아니다. 최종 제출 목록은 각 업체의 신청 화면과 담당자가 확정한다.

- 사업자 형태, 사업자등록 정보, 대표자/계약 담당자, 연락 가능한 업무 메일, 정산받을 사업자 계좌.
- 서비스 설명: 크리에이터가 이미지·동영상 콘텐츠를 제공하고 팬이 월 멤버십을 구독하며 플랫폼이 수수료를 공제한 수익을 크리에이터에게 지급한다.
- 도메인 `crefans.com`, 심사자가 접근할 서비스 소개·가격·해지·환불 안내, 이용약관과 개인정보처리방침. 아직 공개되지 않았다면 준비 상태를 정확히 알린다.
- 예상 월 결제액·인증 건수·크리에이터 수·지급 건수. 수치는 사용자가 정하며 임의로 매출 실적을 작성하지 않는다.
- 허용 콘텐츠 범위. 성인 대상 콘텐츠를 취급할 계획이 있으면 실제 범위를 PG·본인확인·호스팅 업체에 정확히 알리고 계약 가능 여부를 확인한다. 성인 인증 기능이 있다는 이유로 콘텐츠의 적법성이나 공급사 승인이 보장되는 것은 아니다.
- 가입비·월 최소비용·건별 요금·부가세·보증/예치 조건·해지 조건·데이터 처리/보관 위치를 서면으로 받는다. 공개자료에 없는 가격·심사 기간은 미확정이다.

비밀번호·시크릿 키·신분 서류는 채팅이나 Git에 올리지 않는다. 키는 해당 콘솔에서 로컬 비밀 파일이나 운영 비밀 저장소로 직접 저장한다. 계약 서류는 업체의 공식 제출 경로로 전달한다.

## 토스 카드 자동결제

**확인된 사실:** 자동결제는 리스크 검토 및 추가 계약 대상이다. 자동 갱신 일정은 토스가 대신 실행하지 않으며 서비스가 승인 API를 호출해야 한다. [자동결제 안내](https://docs.tosspayments.com/guides/v2/billing)

### 바로 할 순서

1. [공식 빌링 연동 안내](https://docs.tosspayments.com/guides/v2/billing/integration)를 열고 **API 키 메뉴** 링크로 로그인한다.
2. 계약 전에는 개인 테스트 상점, 계약 후에는 **자동결제용 MID**를 선택한다. **API 개별 연동 키**의 테스트 클라이언트 키와 시크릿 키를 같은 상점에서 가져온다. 결제위젯 키나 다른 상점/라이브 키와 혼합하지 않는다.
3. 서버 `.local/platform.env`의 `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`에 직접 저장한다. `DATA_ENCRYPTION_KEY`는 기존 내부 암호화 키이므로 토스 키로 교체하지 않는다.
4. 운영 신청은 [결제제품 안내](https://docs.tosspayments.com/guides/v2/get-started/payment-products)의 이용 신청 경로를 이용한다. **카드 자동결제와 크리에이터 플랫폼 구조**를 명시한다. 대표자 또는 대리인 휴대폰 인증은 사용자가 진행한다.
5. 계약 승인 후 라이브 키는 운영 환경에만 저장하고, 별도 승인된 소액 실결제·환불을 진행한다.

**사용자가 완료 후 알려줄 것:** 테스트 상점 선택/키 저장 완료 여부, 빌링 신청 상태, 계약 담당자의 회신. 키 원문은 불필요하다.

**코드 연결:** [PaymentProvider](../../crefans_server/src/platform/payment-provider.ts), [프론트 빌링](../lib/api/billing.ts). 현재 방식은 토스 카드 등록창이다. 복귀 경로는 `/service/billing/success`, `/service/billing/fail`이며 현재 접속 origin을 사용한다. 운영 origin 확정 후 두 경로 접근을 검증한다. 우리 API의 `/api/v1`과 토스 SDK v2/API 버전은 별개다.

**합격 조건:** 카드 등록 후 빌링키 서버 보관, 동일 주문 중복 결제 방지, 첫 결제·갱신·갱신 해지·카드 삭제·취소 결과가 토스 조회/내역과 일치. UI 성공 표시만으로 통과시키지 않는다. 테스트 결제는 실제 출금이 없고 운영과 차이가 있다. [테스트 환경 제약](https://docs.tosspayments.com/guides/v2/get-started/environment), [배포 체크리스트](https://docs.tosspayments.com/guides/v2/deploy-checklist)

**상담 질문:** 개인 크리에이터 입점형 구독 모델의 계약 형태, 콘텐츠 범위 허용 여부, 자동결제 수수료/보증 조건, 지급대행 병행 가능 여부, 환불 후 지급금 차감 방식. 금융 정책 값은 계약 및 사업 결정 후 확정한다.

## PASS 휴대폰 본인확인


### 2026-10-21 실제 연동 재개 확인

배포된 `https://beta.crefans.com/api/v1/identity/start`에 signup 목적 요청을 보내면 HTTP503/PASS_NOT_CONFIGURED다. 로컬·배포용 비공개 설정에는 확인 가능한 공급사 자격정보가 없고, 기존 코드는 공급자 중립 내부 브리지까지만 구현돼 있다. 사용자의 기존 계약 업체/공식 기술 자료 확인을 요청했으며 아직 확인되지 않았다. 공급사를 임의 확정하거나 계약·외부 문의를 제출하지 않았다.

기존 계약이 없다면 우선 후보는 NICE **휴대폰본인확인(PASS 지원)**이다. [공식 이용절차](https://www.niceid.co.kr/cpsite/serv_qstn.nc)는 사업자등록증 등을 포함한 신청과 개발담당자에게 모듈 제공을 안내한다. [공식 상품 안내](https://www.niceid.co.kr/cpsite/prod_mobile.nc)는 PASS/QR·SMS 방식과 계약/동의한 항목의 성명·생년월일·CI/DI 제공을 설명한다. 이 공개 상품 안내만으로 암호화 전문·API 버전·실제 계약 적격성을 확정하지 않는다(확인2026-10-21). PASS 인증서 전자서명과 휴대폰본인확인은 계약 상품을 구분한다.

신청 전 준비할 내용:

- 상품/목적: 휴대폰본인확인, 회원가입 시 실명·중복가입 식별 및 연령 확인, 출금 PIN 설정 시 계정 소유자 재확인. 실제 콘텐츠 허용 범위를 설명하고 공급사 취급 가능 여부를 확인한다.
- 시험 서비스: `https://beta.crefans.com`, 시험 서버 공인IPv4 `15.164.140.26`. 운영 도메인·반환 URL·IP 등록 요건은 공급사의 공식 계약 명세로 확정한다. 기존 내부 HMAC callback을 공급사 반환 URL로 임의 등록하지 않는다.
- 사용자 준비: 사업자 정보/서류, 담당자, 예상 사용량, 계약·요금 확인. 이 문서 작성은 제출·계약·과금 동의가 아니다.
- 공급사 요청 자료: 정확한 상품/SDK·API 버전, Node22/Linux amd64 지원, 테스트 자격정보, 서명·복호화·요청 매칭 방법, CI/확인된 실명/생년월일 제공 조건, 성공·취소·실패 반환 규격. 비밀키는 채팅·Git 대신 비공개 설정에 보관한다.
- 개발 후 검증: 공급사 검증 결과만 수용, 요청/목적/사용자/만료/일회용 증명 연결, 변조·재전송·다른 계정/CI 거부, 실제 휴대폰 인증과 가입/출금 PIN 흐름. 대역 테스트로 실제 인증 완료를 대신하지 않는다.


**신청할 상품은 PASS 앱을 이용할 수 있는 휴대폰 본인확인이다.** 단순 문자 발송 API나 별도 전자서명 상품으로 대체하지 않는다. NICE는 공식 도입 화면에서 PASS/문자 방식, 회원가입·성인 구분, CI/DI 반환을 안내한다. [NICE 도입문의](https://b2b.niceid.co.kr/inquiry), [상품 안내](https://www.niceid.co.kr/cpsite/prod_mobile.nc)

### 바로 할 순서

1. 우선 NICE 도입문의에서 **휴대폰본인확인**을 선택한다. 적용영역은 회원가입, 추가 사용 목적은 출금 PIN 설정 시 계정 소유자 재확인으로 설명한다. 연간 예상 건수·도입 시점은 사용자 예상치를 입력한다. [복사해서 사용할 NICE 문의 초안](./nice-identity-inquiry.md)을 참고한다.
2. 비교 견적이 필요하면 [KCB 오케이네임](https://www.ok-name.co.kr/)의 기업 서비스 도입 창구를 이용한다. 공개된 영업 연락처는 02-708-6300, `sales_okname@koreacb.com`이다. 이번 작업에서는 문의를 보내지 않았다.
3. 업체에 다음을 요청한다: 테스트/운영 자격증명, 계약 상품과 SDK/API 버전, Node.js 또는 Linux 연동자료, 결과 검증·복호화 방법, 제공 CI/실명/생년월일 항목, 테스트 인증 수단, 도메인·콜백·서버 IP 등록 조건, 비용과 필수 서류.
4. 계약·본인 인증·서류 제출은 사용자가 처리한다. 전달받은 공식 기술 문서로 제가 공급사 전용 브리지를 구현한다.
5. 공개 HTTPS 시험 주소에서 실제 휴대폰으로 가입 인증과 출금 PIN 소유자 재확인을 실행한다.

**중요한 주소 구분:** 현재 서비스가 내부 브리지에 알려주는 콜백은 `<PUBLIC_API_ORIGIN>/api/v1/identity/callback`이다. 여기는 내부 HMAC 서명을 요구한다. 이것을 NICE/KCB에 그대로 등록하면 된다고 가정하지 않는다. 공급사 결과를 받는 **브리지 전용 URL은 구현 후 확정**한다.

**저장할 값:** 공급사 원본 키는 브리지용 비밀 저장소에 보관한다. 현재 `PASS_ADAPTER_URL`, `PASS_ADAPTER_SECRET`, `PASS_CALLBACK_SECRET`은 내부 브리지 주소/인증/HMAC 값이며 공급사 키를 그대로 넣는 칸이 아니다. [IdentityProvider](../../crefans_server/src/platform/identity-provider.ts)

**합격 조건:** 실제 인증 결과의 서명/무결성 검증, 회원/목적/요청 연결, 취소·만료·재사용 거절, 다른 사람 인증으로 출금 PIN 설정 차단. 2026-10-22 사용자 확정 기준은 생일 기준 만19세 이상이며, signup의 minimumAge=19와 서명된 adultVerified=true를 필수로 검사한다. 실제 공급사에서 생일 전날/당일과 연초/연말을 검증하고 단순 출생연도 기준을 쓰지 않는다. 공급사 CI 제공 가능 여부와 이용 목적은 계약에서 확정한다.

**아직 확정 불가:** 가격·개통일·업체별 자격증명 이름·콜백 전문. 공개 도입 안내는 확인했으나 계약자용 개발 명세는 확보 전이다.

## 계좌 확인과 크리에이터 지급

**우선 제안:** 토스 결제 상담에 지급대행을 함께 요청한다. 토스는 플랫폼 매출을 셀러에게 지급하는 상품을 제공하며 별도 계약 대상이다. 크레팬스 계약 적합성은 담당자의 승인이 필요하다. [부가 API](https://docs.tosspayments.com/reference/additional)

### 바로 할 순서

1. [지급대행 안내](https://docs.tosspayments.com/guides/v2/payouts)의 **지급대행 서비스 이용 신청하기**로 진입한다.
2. 개인/개인사업자 크리에이터에게 지급할 예정임을 설명한다. 구독 매출과 지급 재원의 연결, 셀러 등록, 본인확인/KYC, 최소비용, 지급 가능 시간, 환불/차감 방식, 필요한 서류를 확인한다.
3. 승인되면 테스트/운영 API 자격증명 및 **지급대행 보안 키**를 확보한다. API 개별 키 메뉴의 보안 키는 JWE 암호화용이며 앱의 `DATA_ENCRYPTION_KEY`와 별개다.
4. 제가 셀러 ID/심사 상태 보관, JWE 요청·응답 처리, 잔액 확인, 동일 지급 식별자 재조회, `seller.changed`·`payout.changed` 수신을 구현한다. **등록할 웹훅 URL은 아직 구현되지 않았으므로 지금 임의 주소를 등록하지 않는다.**
5. 테스트가 끝난 뒤 명시적으로 승인된 소액 운영 지급을 실행하고 실제 입금까지 대조한다. 라이브 지급 테스트에는 비용이 발생한다.

**현재 빠진 것:** [BankProvider](../../crefans_server/src/platform/bank-provider.ts)는 `/accounts/verify`, `/transfers`라는 자체 프로토콜만 호출한다. 토스 `/v2/payouts`와 호환되지 않는다. `BANK_ADAPTER_URL`에 토스 URL을 직접 넣을 수 없고 셀러 관리까지 개발해야 한다.

**공식 테스트 한계:** 지급대행 테스트는 유효한 사업자번호의 법인 셀러만 등록 가능하고 테스트 KYC를 완료할 수 없다. 따라서 개인 크리에이터의 전체 절차는 테스트 환경 통과만으로 입증되지 않는다. 운영에서는 개인/개인사업자 본인확인과 지급 규모에 따른 KYC 상태가 지급 가능 여부에 영향을 준다. [지급대행 테스트·셀러 안내](https://docs.tosspayments.com/guides/v2/payouts)

**예금주 확인은 별도 확인:** 지급대행의 셀러 계좌 검증이 현재 서비스의 계좌 등록 요구를 충족하는지 상담한다. 별도 조회가 필요하다면 [팝빌 예금주조회](https://developers.popbill.com/guide/accountcheck/pb/introduction/service-introduction)를 후보로 검토한다. 조회 상품은 송금 상품이 아니다. 토스 적합성 확인 전에 중복 계약하지 않는다. 이 안내는 팝빌 선정/연동 완료를 뜻하지 않는다.

**합격 조건:** 다른 명의/무효 계좌 거절, 지급 접수와 완료 구분, 중복 요청 1회 지급, 응답 유실 후 결과 복구, 실패 시 잔액 복구, 환불로 줄어든 잔액 초과 지급 차단. 공급사 최종 상태와 은행 입금을 함께 확인한다. `BANK_PAYOUTS_ENABLED=false`를 실검증 준비 전 유지한다.

## 서버와 도메인과 백업

**현재 제안:** 기존 AWS 계정을 재사용하고 서울 리전의 작은 서버로 시작한다. Lightsail은 초기 후보이며 구매 전 예산과 구성을 확정한다. DB는 현재 Compose의 MySQL을 사용하므로 별도 관리형 DB 가입은 필수가 아니다. 단일 서버 장애에 대비한 외부 백업·복구 검증은 필요하다. [현재 배포 구성](../../crefans_server/infra/platform/compose.yml)

### 바로 할 순서

1. 사용자가 AWS 로그인/MFA와 결제수단을 확인한다. 일상 관리 권한은 최소 권한으로 구성한다. 루트 액세스 키를 앱에 넣지 않는다. [AWS IAM 권장사항](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
2. 월 허용 예산과 알림 받을 주소를 정한다. **Billing and Cost Management → Budgets → Create budget**에서 예산 알림을 준비한다. 예산은 자동 지출 상한이 아니다. [공식 예산 안내](https://docs.aws.amazon.com/cost-management/latest/userguide/bcm-lite-create-a-budget.html)
3. [Lightsail 인스턴스 생성 안내](https://docs.aws.amazon.com/lightsail/latest/userguide/getting-started-with-amazon-lightsail.html)에 따라 리전·Linux OS·요금제를 선택한다. 기존 추천 사양은 견적 재확인 후 구매한다. 고정 공인 주소와 원격 관리 권한을 준비한다.
4. 공개 시험 주소는 `staging.crefans.com`, 운영은 `crefans.com`을 제안한다. 이는 새 설정 제안이며 생성 완료 상태가 아니다. 현재 DNS 레코드를 확인하고 웹 레코드만 계획하며 기존 메일 MX/TXT/DKIM은 보존한다.
5. 서버의 웹 포트와 DNS를 연결한 뒤 현재 Caddy 구성을 배포한다. Caddy 자동 HTTPS는 도메인/DNS·외부 접근 등 전제조건을 요구한다. [자동 HTTPS](https://caddyserver.com/docs/automatic-https)
6. DB 백업과 미디어 백업을 서버 외부에 저장하고 별도 환경에서 복원한다. [Lightsail 스냅샷](https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-snapshots-in-amazon-lightsail.html)은 복구 수단 중 하나다. 스냅샷 존재만으로 DB 복원 성공을 주장하지 않는다.

**사용자 결정:** 월예산, 클라우드/리전, 서비스 주소, 백업 보관 기간, 허용 가능한 데이터 손실 시간과 복구 시간, 알림 수신자.

**환경 연결:** 배포용 `APP_DOMAIN`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`는 Compose 설정, `DATABASE_URL`, `FRONTEND_ORIGINS`, `PUBLIC_API_ORIGIN`, `LOCAL_AUTH_SECRET`, `DATA_ENCRYPTION_KEY`, `MEDIA_ROOT`는 서버 runtime 설정이다. 내부 생성 비밀값은 별도 서비스에서 발급받지 않는다. 로컬 개발 DB 주소를 운영에 복사하지 않는다. [환경 템플릿](../../crefans_server/infra/platform/runtime.env.example), [Caddyfile](../../crefans_server/infra/platform/Caddyfile)

**합격 조건:** HTTPS·Secure 쿠키·콜백 접근·재시작 복구·DB 비공개·권한 보호·백업 복원·worker 단일 실행 확인. 본인확인/결제/출금 스케줄러의 운영 검증은 별도다.

## 미디어 저장소와 CDN

**현재 코드(2026-10-22):** [MediaController](../../crefans_server/src/platform/media.controller.ts)는 `MEDIA_STORAGE=s3`일 때 임시 업로드/검사 후 비공개 S3에 저장한다. GET/HEAD/Range마다 세션·구독·환불용 열람 기록을 확인한 뒤 서버가 스트리밍한다. `S3_MEDIA_BUCKET`, `AWS_REGION`과 EC2 역할을 사용하며 CDN 서명 키는 필요하지 않다. 기존 `S3_UPLOAD_BUCKET/S3_PROCESSED_BUCKET`은 legacy 읽기용이다. [운영 구성·검증·롤백](../../crefans_server/docs/private-media.md)을 우선한다.

1. 전용 비공개 S3와 전용 접두어 최소 IAM 역할을 사용한다. 원본 직접 접근은 거부한다.
2. 기존 CDN 직접 경로는 비활성화·캐시 무효화·S3 OAC 허용 제거로 닫는다. 단순 URL 공유를 권한으로 인정하지 않는다.
3. 같은 주소를 다른 세션에서 열었을 때 거부되는지, 해지예약 잔여 기간/만료/로그아웃/HEAD/Range/재생·seek를 검사한다.
4. 서버 전송량·동시 연결·DB 권한 조회 부하는 별도 산정한다. 이전 CDN 직접전송 비용절감 가정을 적용하지 않는다.
5. HLS/다중 화질/DRM 및 백업·복원은 별도 과제다. 이미 받은 파일이나 녹화를 회수하는 기능을 의미하지 않는다.

## 이메일 전달성 및 선택적 SES 전환

현재 Workspace SMTP 연결과 `no-reply@crefans.com` 발신은 작동한다. 이전 수신 원본에서 SPF/DKIM/DMARC 통과를 확인했지만 Gmail 스팸은 남아 있다. 최신 두 주소 발송의 SMTP 접수는 실제 받은편지함 도착과 다르다.

### 우선 Google에서 확인

1. 사용자가 기존 Google 계정으로 로그인한다. [Postmaster 설정 안내](https://support.google.com/mail/answer/9981691?hl=en)에 따라 `crefans.com`을 추가하고 DNS 소유 확인을 한다. 기존 등록 여부를 먼저 확인한다.
2. 최신 스팸 원본과 정상 도착 원본을 비교한다. 원본은 개인 주소와 식별 정보를 포함하므로 공개 문서/Git에 저장하지 않는다.
3. 소유 확인과 발신 요구사항 충족 후 **Report delivery issue → Create new report**로 신고 자료를 준비한다. 실제 제출은 사용자 승인 후 진행한다. [오분류 신고 절차](https://support.google.com/mail/answer/16740603?hl=en)
4. 적은 발송량에서는 Postmaster 지표가 표시되지 않을 수 있다. 통계 생성을 위해 불필요한 메일을 대량 발송하지 않는다. [대시보드 제약](https://support.google.com/mail/answer/14668346?hl=en)

### SES는 대안이며 아직 전환하지 않음

AWS를 활용할 경우 비교할 후보다. 공급자 변경만으로 스팸 해결을 보장하지 않는다.

1. AWS 로그인 후 SES에서 사용할 리전을 선택하고 기존 도메인 인증 상태를 확인한다. 미설정이면 발신 도메인/DKIM을 검증한다. [SES 시작](https://docs.aws.amazon.com/ses/latest/dg/setting-up.html)
2. **Account dashboard → Get set up → Request production access**에서 거래성 메일(Transactional), 실제 공개 사이트, 연락처를 준비한다. 반송/불만 처리 절차를 구현·운영할 수 있는지 확인하고 사실대로 제출한다. 샌드박스는 리전별이며 인증된 수신자 등에만 발송 가능하다. [운영 전환 조건](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
3. **SMTP settings → Create SMTP Credentials**에서 SMTP 전용 자격증명을 발급한다. 일반 AWS 로그인 비밀번호/액세스 비밀키와 다르다. [SMTP 키 발급](https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html)
4. 해당 리전의 공식 SMTP endpoint와 TLS 방식에 맞춰 기존 `SMTP_HOST/PORT/SECURE/USER/PASSWORD`를 바꾸고 발신 주소를 유지한다. 반송/불만 수신과 재발송 억제 연결은 추가 개발 항목이다.
5. 승인된 Gmail·네이버·Workspace 수신자에서 실제 인증 흐름과 분류를 비교한다. 외부 발송 대상은 사용자 승인을 받는다.

**사용자 역할:** 계정 로그인/MFA, DNS 접근, 대안 사용 결정, 심사 제출 내용 확인, 실제 수신함 확인. **완료 기준:** 발송 접수·수신·스팸 분류·코드 소비를 각각 기록한다. 로고는 본문에 포함됐지만 수신함 발신자 프로필 로고는 별도 문제다.

## 운영 알림

추가 유료 모니터링 업체를 지금 반드시 계약할 필요는 없다. AWS를 선택하면 CloudWatch를 우선 검토한다. 알람은 지표와 임계값에 따라 동작하며 필요한 앱/worker 지표를 수집해야 한다. [CloudWatch 알람](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html)

사용자는 알림 받을 업무 주소와 대응 담당자를 정한다. 제가 API 장애, DB/디스크 여유, 갱신 작업 정지, 결제/지급 미확인 건, 메일 실패, 백업 실패를 감지할 지표·알림 경로를 구현한다. 위 항목이 현재 모두 구현됐다는 뜻은 아니다. 사용자 구독 메일과 장애 알림의 수신 실패가 함께 묻히지 않도록 경로를 검증한다.

합격 조건은 의도적인 시험 장애가 알림을 만들고 담당자가 수신하는 것이다. 단순히 대시보드가 생긴 것으로 끝내지 않는다.

## 키를 받은 뒤 이어갈 작업

| 받은 정보 | 저장/적용 위치 | 바로 가능한가 |
| --- | --- | --- |
| 토스 같은 테스트 MID의 클라이언트/시크릿 키 | `.local/platform.env`의 `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY` | 설정 후 실공급자 테스트 가능 |
| NICE/KCB 계약·공식 연동 명세·원본 키 | 신규 공급사 브리지의 비밀 설정 | 브리지 개발 선행 |
| 지급대행 계약·시크릿/보안 키·테스트 권한 | 신규 지급대행 구현의 비밀 설정 | 셀러·지급 이벤트 개발 선행 |
| AWS 권한·리전·도메인·예산 승인 | 운영 배포 설정 | 구성/배포/복구 검증 필요 |
| SES SMTP 키와 승인 상태 | 기존 SMTP 설정 | 발송 연결 가능, 반송/불만 처리 추가 |
| S3 리소스·권한 | 비공개 저장·세션별 API 전송 | 코드·운영 검증은 최신 미디어 증거 참조 |

DB 수수료율/정산 보류 정책과 `RENEWAL_MAX_RETRIES`, `RENEWAL_RETRY_HOURS`는 공급사 키가 아니다. 사업자가 정책을 확정해야 한다. 출시용 약관/개인정보처리방침에는 실제 계약 공급자와 처리 내용을 반영한다. 가격·환불·세무·콘텐츠 적법성은 이 연결 안내에서 확정하지 않는다.

## 이번 확인의 증거와 제외 범위

공식 문서의 절차와 로컬 소스를 대조했다. NICE 도입 화면은 검색 색인에 신청 항목이 표시됐지만 직접 읽기에서는 본문이 추출되지 않았다. 따라서 화면 단계 전체를 검증했다고 주장하지 않으며 실제 신청 시 확인한다. KCB는 공식 기업 홈페이지를 확인했고 계약자용 기술 자료는 미확보다.

확인 대상 코드는 서버의 환경 템플릿·PaymentProvider·IdentityProvider·BankProvider·MediaController·배포 Compose/Caddy와 프론트 빌링 복귀 경로다. `.env` 비밀값이나 공급사 콘솔 계약 상태는 이번 조사에서 열람하지 않았다. 현재 상태는 코드와 앞선 검증 기록 기준이며 새 키가 추가됐는지는 실제 연결 직전에 재확인한다.

[조사 증거](./audit/third-party-setup-verification-20261009.json)에 저장소 커밋/미커밋 상태, 소스 해시, 확인 시각과 검사 결과를 남긴다. [문서 검사](./documentation-verification.md)는 누락·로컬 참조·코드 계약·스냅샷 일치를 검사하며 공급사 승인이나 운영 동작을 증명하지 않는다. 제품 테스트는 이번 문서 작업에서 재실행하지 않는다.

## 2026-10-21 토스 연결 후속 상태
테스트 키는 로컬 비밀 설정에 저장했다. 실제 sandbox 카드 등록·빌링 최초 승인·갱신·해지·환불·키 삭제 검증 완료. 일반 단건결제창은 연결됐으나 카드사 인증을 사용자가 지금 진행하기 어려워 최종 승인/취소는 미검증. 신규 주문으로 카드사 인증을 마친 뒤 계속한다. 가입비 미결제, 운영 계약/라이브 키 미완료. API3001은 재시작 승인 거절로 종료 상태. 세부 인수인계는 양쪽 PROGRESS.md의 2026-10-21 기록 및 [검증 증거](./audit/toss-verification-20261021.json)를 따른다.

### 빌링 상시 사용 연결 후속
2026-10-21 후속에서 API3001과 worker를 `npm run dev:billing`로 다시 실행했다. 앞선 API 중지 기록은 당시 상태이며 현재는 실행 중이다. `/service/membership/:creator`→카드 등록→결제→구독 저장을 사용한다. 테스트 키이므로 실제 구독 DB/권한/갱신 처리를 수행해도 실청구는 없다. 로컬 전용 테스트 정책과 운영 전환 조건은 [배포 안내](../../crefans_server/infra/platform/README.md)의 로컬 빌링 절을 따른다.

2026-10-21 환불 정책 갱신: 기본 종료는 갱신 해지 예약. 미이용 결제에 한해 전액 환불 API를 준비하고 UI 진입은 숨긴다. 종전 REFUND_WINDOW_DAYS는 현재 미사용이며 이용 기록 없는 과거 결제는 자동 판정하지 않는다. 상세는 백엔드 `docs/provider-contracts.md`의 미이용 환불 절을 따른다.

2026-10-21 추가: 수수료율/정산 보류는 환경 키가 아닌 DB financial_policies에서 관리한다. 활성 SUPER_ADMIN용 GET/PUT /api/v1/admin/financial-policy와 이력 API가 준비되어 있으며, 신규 구독 결제에 재시작 없이 적용하고 기존 구독 갱신은 snapshot을 유지한다. 운영 초기값은 미정이며 테스트10%/0일은 로컬 최초 초기화에만 사용한다.
