// 2026-11-09 토스 심사 전 점검: 옛(Cognito 시절) 화면이 운영에서 열리며 404 API 호출·오류 문구·다른 상호를 보였다.
// 새 결제 흐름은 /service/* 로만 돌아오므로 옛 경로는 대응하는 새 화면으로 임시 이동(307)한다. 코드 삭제는 별도 작업.
const legacyRedirects = [
  ['/home', '/service/feed'], ['/feed', '/service/feed'], ['/explore', '/service/explore'], ['/search', '/service/explore'],
  ['/board', '/service/notices'], ['/board/:id', '/service/notices'], ['/support', '/service/support'],
  ['/login', '/service/login'], ['/email-verification', '/service/login'],
  ['/profile', '/service/me'], ['/profile/edit', '/service/me'], ['/settings', '/service/settings'], ['/write', '/service/studio'],
  ['/payment-history', '/service/subscriptions'], ['/payment/success', '/service/beans'], ['/payment/fail', '/service/beans'],
  ['/subscription/billing/success', '/service/subscriptions'], ['/subscription/billing/fail', '/service/subscriptions'],
  ['/subscription/manage', '/service/subscriptions'], ['/subscription/:creatorId', '/service/membership/:creatorId'],
  ['/post/:id', '/service/post/:id'], ['/creator-center', '/service/studio'], ['/creator-center/:path*', '/service/studio'],
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 환경에서 Strict Mode 비활성화 (HTTP 중복 요청 방지)
  reactStrictMode: false,
  distDir: process.env.CREFANS_E2E === 'true' ? '.next-e2e' : '.next',
  // Runtime images copy only traced files (.next/standalone) plus public and .next/static (infra/platform/Dockerfile).
  output: 'standalone',
  // Share scrapers that do not run JavaScript must get metadata in <head> (Next 15.2+ streams it otherwise).
  // Next's default list plus Korean messengers/portals (KakaoTalk, Daum, Naver, LINE, Telegram, Band) (2026-11-01).
  // Event pages lost their 'beta-' prefix (2026-11-01 SEO decision); old links and indexed URLs move permanently (301).
  async redirects() {
    return ['feedback', 'creator-advertising', 'promotion-beans', 'founding-badge'].flatMap(id =>
      ['service', 'preview'].map(base => ({source: `/${base}/events/beta-${id}`, destination: `/${base}/events/${id}`, statusCode: 301})))
      .concat(['service', 'preview'].map(base => ({source: `/${base}/events/beta-first`, destination: `/${base}/events`, statusCode: 301})))
      .concat(legacyRedirects.map(([source, destination]) => ({source, destination, permanent: false})));
  },
  htmlLimitedBots: /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|kakaotalk-scrap|Daum|Daumoa|NaverBot|naver|Line\/|TelegramBot|BAND|Pinterest/i,
}

module.exports = nextConfig