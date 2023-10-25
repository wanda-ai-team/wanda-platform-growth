
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        // Read a token from the environment variables
        const token = process.env.SLACK_TOKEN;

        // Initialize
        const web = new WebClient(token);
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