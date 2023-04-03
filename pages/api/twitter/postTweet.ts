// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import getDBEntry from "@/utils/api/db/getDBEntry";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { TwitterApi } from 'twitter-api-v2';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const session = await getServerSession(req, res, authOptions);

        const thread = JSON.parse(req.body).thread;
        if (
            session === null ||
            session === undefined ||
            session.user === null ||
            session.user === undefined
        ) {
            console.log("Missing session error");
            res.status(400).end();
            return;
        }

        const user = await getDBEntry(
            "accounts",
            ["userId"],
            ["=="],
            [session.user.id],
            1
        );

        const twitterClient = new TwitterApi({
            appKey: process.env.TWITTER_CLIENT_ID as string,
            appSecret: process.env.TWITTER_CLIENT_SECRET as string,
            accessToken: user[0].data.oauth_token,
            accessSecret: user[0].data.oauth_token_secret,
        });

        const threadF = await twitterClient.v1.tweetThread(thread);
        if (threadF.length > 0) {
            return res.status(200).json({
                content: "https://twitter.com/" + threadF[0].user.screen_name + "/status/" + threadF[0].id_str,
                success: true,
            });
        } else {
            return res.status(400).json({
                content: "threadF",
                success: false,
            });
        }


    } catch (e: any) {
        console.log(e);
        return res.status(400).json({
            content: e.data.errors[0].message !== undefined ? e.data.errors[0].message : "error",
            success: false,
        } as {
            name: string;
            content: string;
            success: boolean;
        });
    }
}
