import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Stakera</title>
        <meta
          name="description"
          content="A lossless lottery platform built on Solana Liquidity Staking"
        />
        <meta
          name="keywords"
          content="Stakera, lottery, lossless, crypto, win, blockchain, solana"
        />{" "}
        {/* SEO keywords */}
        <meta name="author" content="Stakera Team" />
        {/* Open Graph and Twitter meta tags as mentioned above */}
        <meta property="og:title" content="Stakera | Lottery" />
        <meta
          property="og:description"
          content="A lossless lottery platform built on Solana Liquidity Staking"
        />
        <meta property="og:image" content="/stakerameta.png" />
        <meta property="og:url" content="https://stakera.io/lottery" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Stakera" />
        <meta
          name="twitter:description"
          content="A lossless lottery platform built on Solana Liquidity Staking"
        />
        <meta name="twitter:image" content="/stakerameta.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
