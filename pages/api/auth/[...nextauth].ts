import NextAuth, { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  // Configure one or more authentication providers
  providers: [
    TwitterProvider({
      clientId: "UjFfLTFYMW1sQk9xNVpZelR1VEQ6MTpjaQ",
      clientSecret: "Y2SP4YxqBXIKnay7PPGw-mljNrIAE7rVljHGppBECRqIlxx8Kw",
      version: "2.0", // opt-in to Twitter OAuth 2.0
      // clientId: "6Ea0aKda0TnGPRCroQQRvAqDH",
      // clientSecret: "zAwEz6aqpDBEbiUYJj6df8YV0v8Ny6sfPXPPHV72oCBAdn0WYJ",
    }),
    // ...add more providers here
  ],
  adapter: FirestoreAdapter({
    apiKey:
      process.env.FIREBASE_API_KEY === undefined
        ? "AIzaSyCLLwTFGWtiUTxzIRjbkLXQrAmmJ5XPw1k"
        : process.env.FIREBASE_API_KEY,
    authDomain:
      process.env.FIREBASE_AUTH_DOMAIN === undefined
        ? "wanda-dev-47016.firebaseapp.com"
        : process.env.FIREBASE_AUTH_DOMAIN,
    projectId:
      process.env.FIREBASE_PROJECT_ID === undefined
        ? "wanda-dev-47016"
        : process.env.FIREBASE_PROJECT_ID,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET === undefined
        ? "wanda-dev-47016.appspot.com"
        : process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId:
      process.env.FIREBASE_MESSAGING_SENDER_ID === undefined
        ? "1045016169287"
        : process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId:
      process.env.FIREBASE_APP_ID === undefined
        ? "1:1045016169287:web:a4f5b484f4b8d7b5d59a62"
        : process.env.FIREBASE_APP_ID,
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
