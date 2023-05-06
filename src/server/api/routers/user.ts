import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";

const generateUserNameFromClerkUser = (user: {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}) => {
  const uuid = randomUUID().slice(0, 8);
  return `${user.firstName ?? randomUUID().slice(0, 8)}-${uuid}`;
};

// Create a new ratelimiter, that allows 5 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

const throwIfNotSuccess = (success: boolean) => {
  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "You are doing that too much.",
    });
  }
};

const getClerkUser = async (id: string) => {
  const [user] = await clerkClient.users.getUserList({
    userId: [id],
  });
  if (!user) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Clerk user not found",
    });
  }
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
  };
};

export const userRouter = createTRPCRouter({
  create: privateProcedure.mutation(async ({ ctx }) => {
    const clerkUser = await getClerkUser(ctx.userId);
    const userId = clerkUser.id;
    const { success } = await ratelimit.limit(userId);

    throwIfNotSuccess(success);
    const userName = generateUserNameFromClerkUser(clerkUser);

    const user = await ctx.prisma.user
      .create({
        data: {
          ...clerkUser,
          id: userId,
          userName: userName,
        },
      })
      .catch((e) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            console.log(`Attepted to register exiting user ${userId}`);
          } else {
            throw e;
          }
        }
      });

    return user;
  }),

  update: privateProcedure
    .input(z.object({ userName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      const { success } = await ratelimit.limit(authorId);
      throwIfNotSuccess(success);

      const user = await ctx.prisma.user.update({
        where: {
          id: authorId,
        },
        data: {
          userName: input.userName,
        },
      });
      return user;
    }),

  get: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
      });
      return user;
    }),

  getByUserName: publicProcedure
    .input(z.object({ userName: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          userName: input.userName,
        },
      });
      return user;
    }),
});
