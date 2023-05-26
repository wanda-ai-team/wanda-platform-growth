import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      isActive: boolean;
      id: string;
      stripeCustomerId: string;
    } & DefaultSession["user"];
  }
  interface User {
    isActive: boolean; stripeCustomerId: string & DefaultUser["user"];
  }
}
