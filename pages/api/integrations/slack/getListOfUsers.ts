
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
        const token = process.env.SLACK_TOKEN;
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
        let filteredUsers: any[] = [];

        await (async () => {
            let users = await web.users.list();
            if (users && users.members) {
                filteredUsers = users.members.filter((user) => {
                    return user.is_bot === false;
                })
                filteredUsers = filteredUsers.map((user: any) => { return { id: user.id, name: user.name } });
            }
        })();


        res.status(200).json({ content: filteredUsers, success: true });
    } catch (error) {
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}