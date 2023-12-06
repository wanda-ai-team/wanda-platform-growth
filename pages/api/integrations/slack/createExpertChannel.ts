
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';
import getDBEntry from "@/utils/api/db/getDBEntry";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import updateDBEntry from "@/utils/api/db/updateDBEntry";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        // Read a token from the environment variables
        const session = await getServerSession(req, res, authOptions)
        // Error handling

        console.log("error");
        if (!session?.user || !session?.user?.email) {
            return res.status(401).json({
                error: {
                    code: "no-access",
                    message: "You are not signed in.",
                },
            });
        }

        // Initialize
        const user = await getDBEntry("users", ["email"], ["=="], [session.user.email], 1);
        const { expertId } = req.body;
        let slackExperts: any[] = user[0].data.slackExperts;

        if (slackExperts.includes(expertId)) {
            return res.status(500).json({ content: "Expert already installed", success: false });
        }
        const expertInfo = await getDBEntry("experts", ["id"], ["=="], [expertId], 1);
        const slackAccessToken = user[0].data.slackAccessToken;

        if (slackExperts === undefined) {
            slackExperts = [];
            slackExperts.push(expertId);
        } else {
            slackExperts.push(expertId);
        }

        await updateDBEntry("users", { slackExperts: slackExperts }, ["email"], ["=="], [session.user.email], 1)

        const web = new WebClient(slackAccessToken);

        let newChannelName = "talk-with-" + expertInfo[0].data.expertName;
        let createdChannel;
        try {
            createdChannel = await web.conversations.create({
                name: newChannelName
            });
        } catch (e) {
            console.log(e);
        }

        try {
            await web.conversations.invite({
                channel: createdChannel?.channel?.id?.toString() as string,
                users: user[0].data.slackUserId
            });

            await web.chat.postMessage({
                channel: createdChannel?.channel?.id?.toString() as string,
                text: "Hello! I'm your personal expert, my name is " + expertInfo[0].data.expertName + ". I'm here to help you with any questions you have. Please feel free to ask me anything!"
            });
        } catch (e) {
            console.log(e);
        }
        res.status(200).json({ content: "No data found", success: false });
    } catch (error) {
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}