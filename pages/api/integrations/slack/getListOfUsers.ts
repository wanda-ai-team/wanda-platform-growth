
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    // Read a token from the environment variables
    const token = "xoxb-4964233382976-6058732941347-whrbzEIRpHhx5CZk2hsS18ki";

    // Initialize
    const web = new WebClient(token);

    const conversationId = 'C061MT4UL05';
    let filteredUsers: any[] = [];

    try {
        await (async () => {
            let users = await web.users.list();
            if (users && users.members) {
                filteredUsers = users.members.filter((user) => {
                    return user.is_bot === false;
                })
                filteredUsers = filteredUsers.map((user: any) => { return { id: user.id, name: user.name } });
            }
        })();

        // (async () => {
        //     const result = await web.chat.postMessage({
        //         text: req.body.businessInfo,
        //         channel: conversationId,
        //     });
        //     console.log(`Successfully send message ${result.ts} in conversation ${conversationId}`);
        // })();


        res.status(200).json({ content: filteredUsers, success: true });
    } catch (error) {
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}