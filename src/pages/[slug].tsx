import type { InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { type GetStaticPropsContext } from "next";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { api } from "~/utils/api";
import Image from "next/image";
import { PageLayout } from "~/components/layout";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const ProfilePage: NextPage<PageProps> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username: username,
  });
  console.log("Data", data);
  if (!data) {
    return <div>404</div>;
  }
  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 border-slate-400 bg-slate-600">
          <Image
            src={data.profilePicture}
            alt={`${data.name}'s profile image`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-slate-950"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl">{`@${data.name}`}</div>
        <div className="border-b border-slate-200"></div>
      </PageLayout>
    </>
  );
};

export async function getStaticProps(
  context: GetStaticPropsContext<{ slug: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });
  const slug = context.params?.slug;
  console.log("Slug", slug);
  if (!slug) {
    throw new Error("No slug"); // Should return a new page or something
  }

  const username = slug.replace("@", "");
  await helpers.profile.getUserByUsername.prefetch({ username: username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
    revalidate: 1,
  };
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
