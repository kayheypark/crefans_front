import type { Metadata, Viewport } from "next";
import PresentationProviders from "@/components/providers/PresentationProviders";
import StyledComponentsRegistry from "@/lib/AntdRegistry";
import ApplicationProviders from "@/components/providers/ApplicationProviders";
import { Suspense } from "react";
import "antd/dist/reset.css";
import "./globals.css";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/seo/site";

// Site-wide search and share defaults (lib/seo/site.ts); public service pages refine them, private ones opt out.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "ko_KR", url: "/", title: SITE_TITLE, description: SITE_DESCRIPTION, images: [DEFAULT_OG_IMAGE] },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION, images: [DEFAULT_OG_IMAGE.url] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google Tag Manager - 프로덕션 환경에서만 로드 */}
        {process.env.NEXT_PUBLIC_APP_ENV === "prod" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-TJT3DRTV');
              `,
            }}
          />
        )}

        {/* Google Analytics - 프로덕션 환경에서만 로드 */}
        {process.env.NEXT_PUBLIC_APP_ENV === "prod" && (
          <>
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-C03XMCFWTM"
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-C03XMCFWTM');
                `,
              }}
            />
          </>
        )}
      </head>
      <body>
        {/* Google Tag Manager (noscript) - 프로덕션 환경에서만 표시 */}
        {process.env.NEXT_PUBLIC_APP_ENV === "prod" && (
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-TJT3DRTV"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <StyledComponentsRegistry>
          <PresentationProviders>
              <ApplicationProviders>
                <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
              </ApplicationProviders>
            </PresentationProviders>
        </StyledComponentsRegistry>

        {/* Beusable RUM - 프로덕션 환경에서만 로드 */}
        {process.env.NEXT_PUBLIC_APP_ENV === "prod" && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w, d, a){
                    w.__beusablerumclient__ = {
                        load : function(src){
                            var b = d.createElement("script");
                            b.src = src; b.async=true; b.type = "text/javascript";
                            d.getElementsByTagName("head")[0].appendChild(b);
                        }
                    };w.__beusablerumclient__.load(a + "?url=" + encodeURIComponent(d.URL));
                })(window, document, "//rum.beusable.net/load/b250905e064716u981");
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
