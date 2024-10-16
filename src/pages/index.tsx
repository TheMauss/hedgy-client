import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title></title>
        <meta
          name="description"
          content="Hedgy is an advanced delta-neutral strategy built on the JLP token and Drift Trade platform. Designed to maximize returns while minimizing market risks, Hedgy offers an automated approach to optimizing your investment strategy."
        />
        <meta name="keywords" content="Delta Neutral, DeFi, JLP, Drift Trade" />{" "}
        {/* SEO keywords */}
        <meta name="author" content="" />
        {/* Open Graph and Twitter meta tags as mentioned above */}
        <meta property="og:title" content="Hedgy Market" />
        <meta
          property="og:description"
          content="Hedgy is an advanced delta-neutral strategy built on the JLP token and Drift Trade platform. Designed to maximize returns while minimizing market risks, Hedgy offers an automated approach to optimizing your investment strategy."
        />
        <meta property="og:image" content="/strat.png" />
        <meta property="og:url" content="https://hedgy.market/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="" />
        <meta
          name="twitter:description"
          content="Hedgy is an advanced delta-neutral strategy built on the JLP token and Drift Trade platform. Designed to maximize returns while minimizing market risks, Hedgy offers an automated approach to optimizing your investment strategy."
        />
        <meta name="twitter:image" content="/strat.png" />
        <link rel="icon" href="/hedgy.svg" />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
