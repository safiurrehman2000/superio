"use client";
import Loading from "@/components/loading/Loading";
import Aos from "aos";
import "aos/dist/aos.css";
import { Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import ScrollToTop from "../components/common/ScrollTop";
import SubscriptionBanner from "@/components/common/SubscriptionBanner";
import { store } from "../store/store";
import "../styles/index.scss";

import RouteGuard from "./RouteGuard";

if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export default function RootLayout({ children }) {
  useEffect(() => {
    Aos.init({
      duration: 1400,
      once: true,
    });
  }, []);

  return (
    <html lang="nl">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FA5508" />
        <meta
          name="google-site-verification"
          content="JSu8CmZDHQoQxsc6-JvT-pJHJeIZBKarp_LEOEtGZwc"
        />
        <meta
          name="keywords"
          content="flexibele jobs, vacatures, werkgevers, kandidaten, flexwerkers, studentenjobs, bijverdienste, Vlaanderen, flexijobber, jobplatform, werken, solliciteren"
        />
        <meta
          name="description"
          content="De Flexijobber - Het toonaangevende platform voor flexibele jobs in Vlaanderen. Verbindt werkgevers met flexwerkers in verschillende sectoren."
        />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="nl_BE" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="De Flexijobber" />
        <meta
          property="og:title"
          content="De Flexijobber - Flexibele Jobs Platform in Vlaanderen"
        />
        <meta
          property="og:description"
          content="De Flexijobber - Het toonaangevende platform voor flexibele jobs in Vlaanderen. Verbindt werkgevers met flexwerkers in verschillende sectoren."
        />
        <meta
          property="og:image"
          content={`${siteUrl}/images/resource/logo.png`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="De Flexijobber - Flexibele Jobs Platform in Vlaanderen"
        />
        <meta
          name="twitter:description"
          content="De Flexijobber - Het toonaangevende platform voor flexibele jobs in Vlaanderen. Verbindt werkgevers met flexwerkers in verschillende sectoren."
        />
        <meta
          name="twitter:image"
          content={`${siteUrl}/images/resource/logo.png`}
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={siteUrl} />
      </head>

      <body>
        <Provider store={store}>
          <Suspense fallback={<Loading />}>
            <RouteGuard>
              <SubscriptionBanner />
              <div className="page-wrapper">
                {children}
                {/* <!-- Scroll To Top --> */}
                <ScrollToTop />
              </div>
              <Toaster />
            </RouteGuard>
          </Suspense>
        </Provider>
      </body>
    </html>
  );
}
