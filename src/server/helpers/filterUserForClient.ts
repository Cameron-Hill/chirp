// import type { User } from "@clerk/nextjs/dist/api";
import type { User } from "@prisma/client";
const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    userName: user.userName,
    profileImageUrl: user.profileImageUrl,
  };
};
export default filterUserForClient;
