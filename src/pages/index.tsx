import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Binary Finance</title>
        <meta
          name="description"
          content="Binary Finance"
        />
      </Head>
      <HomeView/>
    </div>
  );
};

export default Home;
