import type { InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import { type GetStaticPropsContext } from "next";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { generateSSHHelper } from "~/server/helpers/sshHelper";
import { PostView } from "~/components/postView";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const SinglePostPage: NextPage<PageProps> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({ id });
  if (!data) {
    return <div>404</div>;
  }
  return (
    <>
      <Head>
        <title>{`Post ${data.post.content} - ${data.author.name}`}</title>
      </Head>
      <PageLayout>
        <div className="h-20 w-full bg-slate-600"></div>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const helpers = generateSSHHelper();
  const id = context.params?.id;
  if (!id) {
    throw new Error("No slug"); // Should return a new page or something
  }

  await helpers.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
    revalidate: 1,
  };
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
