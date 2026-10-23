const test = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { loadTypeScript } = require("./load-typescript.cjs");
const original = require("./fixtures/landing-content-original.json");

const normalize = (text) =>
  text
    .replace(/<[^>]*>/g, "")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, "");
const icon = () => null;
const icons = new Proxy({}, { get: () => icon });
const styles = new Proxy({}, { get: (_, key) => String(key) });
const ServiceIntroduction = loadTypeScript(
  "components/landing/ServiceIntroduction.tsx",
  { "./landing.module.css": styles, "@ant-design/icons": icons },
).default;
const LandingPage = loadTypeScript("components/landing/LandingPage.tsx", {
  "./landing.module.css": styles,
  "@ant-design/icons": icons,
  "./HeroSlider": { __esModule: true, default: () => null },
  "./ServiceShowcase": { __esModule: true, default: () => null },
  "./ServiceIntroduction": { __esModule: true, default: ServiceIntroduction },
  "next/link": {
    __esModule: true,
    default: ({ children, ...props }) =>
      React.createElement("a", props, children),
  },
  "@/app/(main)/home/SignUpModal": { __esModule: true, default: () => null },
  "@/components/modals/LoginModal": { __esModule: true, default: () => null },
  "@/features/landing/useLandingModel": {
    useLandingModel: () => ({
      signedIn: false,
      dialog: null,
      isEarlybird: false,
      start() {},
      startEarlybird() {},
      closeDialog() {},
      openLogin() {},
    }),
  },
}).default;
test("redesigned landing retains every original introduction string and disclaimer", () => {
  const html = normalize(
    renderToStaticMarkup(React.createElement(LandingPage)),
  );
  for (const text of original)
    assert.ok(
      html.includes(normalize(text)),
      `Missing original content: ${text}`,
    );
});
