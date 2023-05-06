import { LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";
import { useState } from "react";
import { useRouter } from "next/router";

const RegisterPage = () => {
  const [callMade, setCallMade] = useState(false);
  const router = useRouter();

  const { mutate, isLoading } = api.user.create.useMutation({
    onSuccess: async () => {
      await router.push("/");
    },
    onError: (err) => {
      console.log(err.data);
      return <div>An Error Occured ☠️</div>;
    },
  });
  if (!callMade && !isLoading) {
    setCallMade(true);
    mutate();
  }
  return (
    <div className="h-screen">
      <LoadingPage />
    </div>
  );
};

export default RegisterPage;
