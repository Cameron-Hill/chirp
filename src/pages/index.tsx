import { type NextPage } from "next";
import { SignInButton, useUser } from "@clerk/nextjs";

import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postView";
import Link from "next/link";

const CreatePostWizard = () => {
  const { user } = useUser();
  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      void ctx.posts.getAll.invalidate(); // void this to avoid promise warning
    },
    onError: (err) => {
      const error = err.data?.zodError?.fieldErrors?.content;
      if (error && error[0]) {
        toast.error(error[0]);
      } else {
        console.error(err);
        toast.error("Something went wrong. Please try again later.");
      }
    },
  });

  if (!user) return null;

  const { data: profileData, isLoading } = api.user.get.useQuery({
    userId: user.id,
  });
  if (isLoading || !profileData) return <LoadingSpinner size={24} />;
  return (
    <div className="flex w-full gap-3">
      <Link href={`/@${profileData.userName}`}>
        <Image
          src={profileData.profileImageUrl ?? "/default-profile.png"}
          alt="profile image"
          className="h-14 w-14 rounded-full"
          width="56"
          height="56"
        />
      </Link>
      <input
        placeholder="Type Some Emojis!"
        className="grow bg-transparent outline-none"
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isPosting) {
            mutate({ content: e.currentTarget.value });
            e.currentTarget.value = "";
          }
        }}
      />
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={24} />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if (postsLoading) return <LoadingPage />;
  if (!data) return <div>No data for you ☹️</div>;

  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // start fetching right away
  api.posts.getAll.useQuery();
  if (!userLoaded) return <div />;

  return (
    <PageLayout homePage>
      <div className="flex border-b border-slate-400 p-4 ">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton afterSignUpUrl="/register" />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;
