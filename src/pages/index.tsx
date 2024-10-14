import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title></title>
        <meta name="description" content="" />
        <meta name="keywords" content="" /> {/* SEO keywords */}
        <meta name="author" content="" />
        {/* Open Graph and Twitter meta tags as mentioned above */}
        <meta property="og:title" content="" />
        <meta property="og:description" content="" />
        <meta property="og:image" content="/meta.png" />
        <meta property="og:url" content="https://.io/lottery" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="" />
        <meta name="twitter:description" content="" />
        <meta name="twitter:image" content="" />
        <link rel="icon" href="/logoico.png" />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
