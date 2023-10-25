
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';
import { list } from "@vercel/blob";
import { openAICall } from "@/utils/api/openAI/openAICalls";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        // Read a token from the environment variables
        const token = process.env.SLACK_TOKEN;

        // Initialize
        const web = new WebClient(token);

        // switch (req.body.type) {
        //     case "url_verification":
        //         res.status(200).json({ content: req.body.challenge, success: true });
        //         return;
        //     case "event_callback":
        //         break;
        //     default:
        //         res.status(200).json({ content: "No data found", success: false });
        //         return;
        // }

        console.log("sendSlackMessage");
        console.log(req.body);

        const responseOpenAI = await openAICall(false, "userContent", "systemContent");
        (async () => {
            const response = await web.chat.postMessage({
                channel: "C061MT4UL05",
                text: responseOpenAI,
            });
            console.log(response);
        })();


        res.status(200).json({ content: "No data found", success: false });
    } catch (error) {
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}