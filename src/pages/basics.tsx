import type { NextPage } from "next";
import Head from "next/head";
import { BasicsView } from "../views";

const Basics: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Solana Scaffold</title>
        <meta name="description" content="Binary Finance" />
      </Head>
      <BasicsView />
    </div>
  );
};

export default Basics;
