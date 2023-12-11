
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

        const { expertId } = req.body;

        console.log("slackExperts");
        // Initialize
        const user = await getDBEntry("users", ["email"], ["=="], [session.user.email], 1);

        let slackExperts: any[] = user[0].data.slackExperts;

        if (!slackExperts.includes(expertId)) {
            return res.status(500).json({ content: "Expert already uninstalled", success: false });
        }
        const expertInfo = await getDBEntry("experts", ["id"], ["=="], [expertId], 1);

        console.log(slackExperts);
        if (slackExperts === undefined) {
            slackExperts = [];
        } else {
            slackExperts = slackExperts.filter((expert) => expert !== expertId);
        }

        console.log("talk-with-" + expertInfo[0].data.expertName);

        const slackAccessToken = user[0].data.slackAccessToken;

        const web = new WebClient(slackAccessToken);
        let createdChannel;
        try {
            createdChannel = await web.conversations.close({
                channel: "talk-with-" + expertInfo[0].data.expertName
            });

            await updateDBEntry("users", { slackExperts: slackExperts }, ["email"], ["=="], [session.user.email], 1)

            console.log(createdChannel);
        } catch (e) {
            console.log(e);
        }

        res.status(200).json({ content: "No data found", success: false });
    } catch (error) {
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}