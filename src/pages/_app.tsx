import { AppProps } from "next/app";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { FC } from "react";
import { ContextProvider } from "../contexts/ContextProvider";
import { FastTradeProvider } from "../contexts/FastTradeContext";
import { AppBar } from "../components/AppBar";
import { ContentContainer } from "../components/ContentContainer";
import { Footer } from "../components/Footer";
import Notifications from "../components/Notification";
import { useRouter } from "next/router";
import ReactGA from "react-ga";
import { Analytics } from "@vercel/analytics/react";
import { PriorityFeeProvider } from "../contexts/PriorityFee";
import { BackupOracleProvider } from "../contexts/BackupOracle";
import { VisibilityProvider } from "../components/VisibilityContext";

require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const router = useRouter();
  const hideFooterFor = ["/", "/futures", "/trade", "/stats", "/vault"]; // Add paths where you don't want to show the footer
  const hideCss = ["/"]; // Add paths where you don't want to show the footer
  const showCss = !hideCss.includes(router.pathname);
  const showFooter = !hideFooterFor.includes(router.pathname);
  const hideAppBarFor = ["/"]; // Add paths where you don't want to show the footer
  const showAppBar = !hideAppBarFor.includes(router.pathname);

  useEffect(() => {
    // Function to track pageviews
    const handleRouteChange = (url: string) => {
      window.gtag("config", "G-N43CYRYXY9", {
        page_path: url,
        page_title: document.title,
      });
    };

    // Track the initial pageview
    handleRouteChange(window.location.pathname);

    // Listen for route changes and track them
    router.events.on("routeChangeComplete", handleRouteChange);

    // Cleanup event listener on unmount
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  const [isContentContainerOpen, setIsContentContainerOpen] = useState(false);

  useEffect(() => {
    if (isContentContainerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isContentContainerOpen]);

  return (
    <>
      <Head>
        <title>PopFi</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-N43CYRYXY9"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-N43CYRYXY9');
            `,
          }}
        />
      </Head>
      <ContextProvider>
        <PriorityFeeProvider>
          <BackupOracleProvider>
            <VisibilityProvider>
              <div className="flex flex-col min-h-screen overflow-hidden">
                {showCss && (
                  <div>
                    <div
                      className="lg:hidden overflow-hidden absolute futures-circles lg:w-4/5 w-full h-full"
                      style={{
                        zIndex: -1,
                        transform: "translate(0%, -75%)",
                        right: "0%",
                      }}
                    >
                      {" "}
                    </div>
                    <div
                      className="hidden lg:flex overflow-hidden absolute futures-circles lg:w-4/5 w-full h-full"
                      style={{
                        zIndex: -1,
                        transform: "translate(-10%, -68%)",
                        right: "0%",
                      }}
                    >
                      {" "}
                    </div>
                  </div>
                )}
                <Notifications />
                <Analytics />
                {showAppBar && (
                  <AppBar isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
                )}
                <div className="overflow-y-auto">
                  <ContentContainer
                    isNavOpen={isNavOpen}
                    setIsNavOpen={setIsNavOpen}
                    setIsContentContainerOpen={setIsContentContainerOpen}
                  >
                    <Component />
                    {showFooter && <Footer />}
                  </ContentContainer>
                </div>
              </div>
            </VisibilityProvider>
          </BackupOracleProvider>
        </PriorityFeeProvider>
      </ContextProvider>
    </>
  );
};

export default App;
