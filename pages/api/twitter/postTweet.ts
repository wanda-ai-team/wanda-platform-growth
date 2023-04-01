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
        console.log(session);
        // const user = getDBEntry("accounts", { username: "test" });

        const twitterClient = new TwitterApi("AAAAAAAAAAAAAAAAAAAAAE8OmQEAAAAArCzWzk8ggBRFtCWLrQbZ9LE6jvw%3DY8jppwJAlbjGd33nk0WCSPWXbDaxw51SdTgh663oBfESUa1QCL"

            // appKey: "8bB9Vbpz0lw9FGdtWim3fYuAn",
            // appSecret: "G2VAkbHQCmhcOm8SwbZUrgLLSejsTGoMUV9yzle40xYiQaeG1l",
            // accessToken: "dnRIdFNXVVdQbk1qdmZIMG0zMm06MTpjaQ",
            // accessSecret: "U0RNbCWV3Z7HfvnopnCbNsig5hYd9sHR-E13TEsLMQYsEs4bzd"

            // clientId: "dnRIdFNXVVdQbk1qdmZIMG0zMm06MTpjaQ",
            // clientSecret: "U0RNbCWV3Z7HfvnopnCbNsig5hYd9sHR-E13TEsLMQYsEs4bzd",
            //dnRIdFNXVVdQbk1qdmZIMG0zMm06MTpjaQ
            //U0RNbCWV3Z7HfvnopnCbNsig5hYd9sHR-E13TEsLMQYsEs4bzd
        );
        console.log("twitterClient");
        const readOnlyClient = twitterClient.v2;
        await readOnlyClient.tweetThread([
            'Hello, lets talk about Twitter!',
            'Twitter is a fantastic social network. Look at this:',
            'This thread is automatically made with twitter-api-v2 :D',
        ]).then((response: any) => {
            console.log(response);
        });

        return res.status(200).json({
            content: "videoID1",
            success: true,
        });


    } catch (e: any) {
        console.log(e);
        return res.status(400).json({
            reason: e,
            success: false,
        } as {
            name: string;
            reason: string;
            success: boolean;
        });
    }
}
