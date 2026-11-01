/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 환경에서 Strict Mode 비활성화 (HTTP 중복 요청 방지)
  reactStrictMode: false,
  distDir: process.env.CREFANS_E2E === 'true' ? '.next-e2e' : '.next',
  // Share scrapers that do not run JavaScript must get metadata in <head> (Next 15.2+ streams it otherwise).
  // Next's default list plus Korean messengers/portals (KakaoTalk, Daum, Naver, LINE, Telegram, Band) (2026-11-01).
  // Event pages lost their 'beta-' prefix (2026-11-01 SEO decision); old links and indexed URLs move permanently (301).
  async redirects() {
    return ['feedback', 'creator-advertising', 'promotion-beans', 'founding-badge'].flatMap(id =>
      ['service', 'preview'].map(base => ({source: `/${base}/events/beta-${id}`, destination: `/${base}/events/${id}`, statusCode: 301})))
      .concat(['service', 'preview'].map(base => ({source: `/${base}/events/beta-first`, destination: `/${base}/events`, statusCode: 301})));
  },
  htmlLimitedBots: /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|kakaotalk-scrap|Daum|Daumoa|NaverBot|naver|Line\/|TelegramBot|BAND|Pinterest/i,
}

module.exports = nextConfig