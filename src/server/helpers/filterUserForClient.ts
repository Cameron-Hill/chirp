import type { User } from "@clerk/nextjs/dist/api";
const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    name: user.username ?? user.firstName ?? "Unknown",
    profilePicture: user.profileImageUrl,
  };
};
export default filterUserForClient;
