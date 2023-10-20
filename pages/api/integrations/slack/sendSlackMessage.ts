
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

    (async () => {
        const users = await web.users.list();
        console.log('Users: ', users);

        const result1 = await await web.chat.postMessage({
            channel: "U05S2RBMMQC",
            text: 'Olá Berna, sou o teu bot favorito',
        });


        // console.log('Conversation created: ', result);
    })();

    // (async () => {
    //     const result = await web.chat.postMessage({
    //         text: req.body.businessInfo,
    //         channel: conversationId,
    //     });
    //     console.log(`Successfully send message ${result.ts} in conversation ${conversationId}`);
    // })();


    res.status(200).json({ content: "No data found", success: false });
}