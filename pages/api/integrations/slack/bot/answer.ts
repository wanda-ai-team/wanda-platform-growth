
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

        console.log("sendSlackMessage");
        console.log(req.body);

        (async () => {
            const response = await web.chat.postMessage({
                channel: "C061MT4UL05",
                text: "Here's a message for you",
            });
            console.log(response);
        })();


        res.status(200).json({ content: "No data found", success: false });
    } catch (error) {
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}