import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    // This will return the session object if available, or null if not authenticated
    return ctx.session;
  }),
  getProtectedSession: protectedProcedure.query(({ ctx }) => {
    // This will only return if the user is authenticated, otherwise it throws UNAUTHORIZED
    return ctx.session;
  }),
});