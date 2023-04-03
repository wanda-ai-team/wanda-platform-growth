import NextAuth, { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "users.read tweet.read tweet.write offline.access like.read list.read",
        },
      },
    }),
  ],
  adapter: FirestoreAdapter({
    apiKey:
      process.env.FIREBASE_API_KEY === undefined
        ? ""
        : process.env.FIREBASE_API_KEY as string,
    authDomain:
      process.env.FIREBASE_AUTH_DOMAIN === undefined
        ? ""
        : process.env.FIREBASE_AUTH_DOMAIN as string,
    projectId:
      process.env.FIREBASE_PROJECT_ID === undefined
        ? ""
        : process.env.FIREBASE_PROJECT_ID as string,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET === undefined
        ? ""
        : process.env.FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId:
      process.env.FIREBASE_MESSAGING_SENDER_ID === undefined
        ? ""
        : process.env.FIREBASE_MESSAGING_SENDER_ID as string,
    appId:
      process.env.FIREBASE_APP_ID === undefined
        ? ""
        : process.env.FIREBASE_APP_ID as string,
  }),

  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.uid as string;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
}
export default NextAuth(authOptions)
