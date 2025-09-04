import type { Metadata } from "next";
import { ConfigProvider, App as AntdApp } from "antd";
import StyledComponentsRegistry from "@/lib/AntdRegistry";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Suspense } from "react";
import "antd/dist/reset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "crefans",
  description: "당신만의 크리에이터를 만나보세요",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
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
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#1890ff",
                colorBgContainer: "#fff",
              },
            }}
          >
            <AntdApp>
              <AuthProvider>
                <NotificationProvider>
                  <Suspense fallback={<div>Loading...</div>}>
                    {children}
                  </Suspense>
                </NotificationProvider>
              </AuthProvider>
            </AntdApp>
          </ConfigProvider>
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
