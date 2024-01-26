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

require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const router = useRouter();
  const hideFooterFor = ["/", "/futures", "/trade"]; // Add paths where you don't want to show the footer
  const showFooter = !hideFooterFor.includes(router.pathname);
  const hideAppBarFor = []; // Add paths where you don't want to show the footer
  const showAppBar = !hideAppBarFor.includes(router.pathname);

  useEffect(() => {
    // Initialize Google Analytics with your tracking ID
    ReactGA.initialize("G-N43CYRYXY9");
    ReactGA.pageview(window.location.pathname);
  }, []);

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
      </Head>
      <ContextProvider>
        <PriorityFeeProvider>
          <div className="flex flex-col min-h-screen overflow-hidden">
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
        </PriorityFeeProvider>
      </ContextProvider>
    </>
  );
};

export default App;
