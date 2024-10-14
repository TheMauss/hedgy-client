import type { NextPage } from "next";
import Head from "next/head";
import { BasicsView } from "../views";

const Basics: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Hedgy</title>
        <meta name="description" content="Hedgy" />
      </Head>
      <BasicsView />
    </div>
  );
};

export default Basics;
