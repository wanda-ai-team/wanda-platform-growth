import NextAuth, { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import updateDBEntry from "@/utils/api/db/updateDBEntry";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import { updateUserInfo } from "@/utils/api/db/updateUser";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
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

      if (token) {
        session.user.image = token.image as string;
        if (!session.user.image) {
          session.user.image = "/assets/icons/defaultAvatar.jpg";
        }
        session.user.isActive = token.isActive as boolean;
        session.user.id = token.id as string;
        session.user.stripeCustomerId = token.stripeCustomerId as string;
      }

      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.image = user.image;
        token.uid = user.id;
        token.isActive = user.isActive;
        token.stripeCustomerId = user.stripeCustomerId;
      }
      return token;
    },
  },
  events: {
    signIn: async (message) => {
      if (message.account !== null) {
        updateDBEntry("accounts", message.account, ['providerAccountId'], ['=='], [message.account.providerAccountId], 1);
        // const dbUser = await getUser("email", "==", user.email);
        if (!message.user.stripeCustomerId) {
          console.log("no stripe customer id");
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2022-11-15",
          });

          stripe.customers
            .create({
              email: message.user.email!,
            })
            .then(async (customer) => {
              const bodyN = {
                stripeCustomerId: customer.id,
                isActive: false,
                id:
                  message.user.email?.split("@")[0] +
                  "-" +
                  message.user.email?.split("@")[1] +
                  "-" +
                  uuidv4(),
              };
              updateUserInfo(bodyN, "email", "==", message.user.email!);
            });
        }

      }

    },

    createUser: async ({ user }) => {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: "2022-11-15",
      });

      stripe.customers
        .create({
          email: user.email!,
        })
        .then(async (customer) => {
          const bodyN = {
            stripeCustomerId: customer.id,
            isActive: false,
            id:
              user.email?.split("@")[0] +
              "-" +
              user.email?.split("@")[1] +
              "-" +
              uuidv4(),
          };
          updateUserInfo(bodyN, "email", "==", user.email!);
        });
    },
  },

  session: {
    strategy: 'jwt',
    updateAge: 12 * 60 * 60, // 24 hours
    maxAge: 1 * 12 * 60 * 60, // 30 days
  },
}
export default NextAuth(authOptions)
