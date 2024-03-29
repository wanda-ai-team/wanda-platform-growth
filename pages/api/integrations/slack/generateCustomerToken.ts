// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import updateDBEntry from "@/utils/api/db/updateDBEntry";
import { WebClient } from "@slack/web-api";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const session = await getServerSession(req, res, authOptions)
        // Error handling

        if (!session?.user || !session?.user?.email) {
            return res.status(401).json({
                error: {
                    code: "no-access",
                    message: "You are not signed in.",
                },
            });
        }

        const { code } = req.body;
        if (!code) {
            return new Response('Bad Request', { status: 400 });
        }

        // Read a token from the environment variables
        const token = process.env.SLACK_TOKEN;

        // Initialize
        const web = new WebClient(token);
        const response = await web.oauth.v2.access({
            code: code as string,
            client_id: process.env.SLACK_CLIENT_ID as string,
            client_secret: process.env.SLACK_CLIENT_SECRET as string,
        })
            .then(async (data) => {
                if (data.access_token !== undefined) {
                    if (data.refresh_token !== undefined && data.expires_in !== undefined) {
                        const currentSeconds = (new Date().getTime() / 1000) + data.expires_in;
                        await updateDBEntry("users", { slackAccessToken: data.access_token, slackRefreshToken: data.refresh_token, slackTokenexpiration: currentSeconds }, ['email'], '==', [session.user.email], 1);
                        return data;
                    }
                }
                return null
            })

        if (response && response.ok) {
            res.status(200).json({ content: "success", success: true });
        } else {
            res.status(500).json({ content: "error", success: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ content: error, success: false });
    }
}