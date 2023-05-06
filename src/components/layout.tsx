import Link from "next/link";
import type { PropsWithChildren } from "react";

type PageLayoutProps = {
  homePage?: boolean;
};

export const PageLayout = ({
  homePage = false,
  children,
}: PropsWithChildren<PageLayoutProps>) => {
  return (
    <>
      {!homePage && (
        <nav className="absolute left-0 top-0 ml-5 mt-3 text-5xl">
          <Link href={"/"}>🏠</Link>
        </nav>
      )}
      <main className="flex h-screen justify-center">
        <div className="no-scrollbar h-full w-full overflow-y-scroll border-x border-slate-400 md:max-w-2xl ">
          {children}
        </div>
      </main>
    </>
  );
};
