import { type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";

const SinglePostPage: NextPage = () => {
  // start fetching right away

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center">SinglePostPage</main>
    </>
  );
};

export default SinglePostPage;
