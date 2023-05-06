import type { InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import { type GetStaticPropsContext } from "next";
import { api } from "~/utils/api";
import Image from "next/image";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postView";
import { generateSSHHelper } from "~/server/helpers/sshHelper";
import { use, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { set } from "zod";
import { LoaderIcon, toast } from "react-hot-toast";
import { useRouter } from "next/router";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading) {
    return <LoadingPage />;
  }
  if (!data || data.length === 0) {
    return <div>User has not posted</div>;
  }
  return (
    <div>
      {data.map((fullPost) => (
        <PostView key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

type EditMenuProps = {
  editable: boolean;
  setEditable: (editable: boolean) => void;
  onConfirm: () => void;
};

const EditMenu = ({ editable, setEditable, onConfirm }: EditMenuProps) => {
  return (
    <div className="bottom-0 right-0 flex flex-col items-end justify-end p-4">
      {!editable && (
        <button
          className="rounded-full bg-slate-700 p-2 text-2xl text-white"
          onClick={() => setEditable(!editable)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
        </button>
      )}
      {editable && (
        <button
          className="rounded-full bg-cyan-500 p-2 text-2xl text-white"
          onClick={() => {
            setEditable(!editable);
            onConfirm();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

const ProfilePage: NextPage<PageProps> = ({ username }) => {
  const { user: currentUser, isSignedIn: isCurrentUserSignedIn } = useUser();
  const [editable, setEditable] = useState(false);
  const { data } = api.user.getByUserName.useQuery({
    userName: username,
  });
  const { mutate, isLoading } = api.user.update.useMutation();
  const [userNameValue, setUserNameValue] = useState(data?.userName);
  const router = useRouter();

  if (!userNameValue && userNameValue !== "") {
    return <div>404</div>;
  }
  if (!data) {
    return <div>404</div>;
  }

  const handleConfirm = () => {
    console.log(`Submitting username change ${userNameValue}`);
    if (!isLoading) {
      mutate(
        { userName: userNameValue },
        {
          onSuccess: (user) => {
            setEditable(false);
            void router.push(`/@${user.userName}`).then(() => {
              console.log("success");
            });
          },
          onError: (e) => {
            console.log(e);
            toast.error("Failed to update username");
          },
        }
      );
    }
  };

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 border-slate-400 bg-slate-600">
          <Image
            src={data.profileImageUrl ?? "/default-profile-image.png"}
            alt={`${data.userName}'s profile image`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-slate-950"
          />
        </div>

        <div className="h-[64px]">
          {isCurrentUserSignedIn &&
            currentUser?.id === data.id &&
            !isLoading && (
              <EditMenu
                editable={editable}
                setEditable={setEditable}
                onConfirm={handleConfirm}
              />
            )}
          {isLoading && <LoaderIcon />}
        </div>
        <div className="p-4 text-2xl">
          {!editable && `@${data.userName}`}
          {editable && (
            <div>
              @
              <input
                className="border-b border-slate-400 bg-inherit"
                value={userNameValue}
                width={userNameValue.length * 16}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirm();
                  }
                }}
                onChange={(e) => {
                  setUserNameValue(e.target.value);
                  console.log(e.target.value);
                }}
              />
            </div>
          )}
        </div>

        <div className="border-b border-slate-200" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export async function getStaticProps(
  context: GetStaticPropsContext<{ slug: string }>
) {
  const helpers = generateSSHHelper();
  const slug = context.params?.slug;
  if (!slug) {
    throw new Error("No slug"); // Should return a new page or something
  }

  const userName = slug.replace("@", "");
  await helpers.user.getByUserName.prefetch({ userName: userName });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username: userName,
    },
    revalidate: 1,
  };
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
