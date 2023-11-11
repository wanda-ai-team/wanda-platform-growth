
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import getDBEntry from "@/utils/api/db/getDBEntry";

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
        const slackAccessToken = user[0].data.slackAccessToken;

        const web = new WebClient(slackAccessToken);
        let filteredChannels: any[] = [];

        await (async () => {
            let channels = await web.conversations.list();
            if (channels && channels.channels) {
                filteredChannels = channels.channels.map((channel: any) => { return { id: channel.id, name: channel.name } });
            }
        })();

        res.status(200).json({ content: filteredChannels, success: true });
    } catch (error) {
        res.status(200).json({ content: error, success: false });
    }
}