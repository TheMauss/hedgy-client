import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>PopFi</title>
        <meta
          name="description"
          content="PopFi"
        />
      </Head>
      <HomeView/>
    </div>
  );
};

export default Home;
