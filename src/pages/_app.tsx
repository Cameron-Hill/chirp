import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Head from "next/head";

const openGraphData = {
  title: "Cams's Chirp",
  description:
    "Chirp is a tutorial project for create-t3-app. You can find the tutorial source here: \
    https://www.youtube.com/watch?v=YkOSUVzOAA4&ab_channel=Theo-t3%E2%80%A4gg",
  url: "https://chirp.cameronhill.co.uk/",
  image:
    "https://cameron-hill-profile-images.s3.eu-west-2.amazonaws.com/page_preview_image.png",
};

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Chirp</title>
        <meta property="og:title" content={openGraphData.title} />
        <meta property="og:description" content={openGraphData.description} />
        <meta property="og:url" content={openGraphData.url} />
        <meta property="og:image" content={openGraphData.image} />
        <meta name="twitter:card" content="summary" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster position="bottom-center" />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
