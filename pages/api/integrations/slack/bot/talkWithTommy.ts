
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';
import { answerQuestion } from "@/utils/api/integrations/slack/bot";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        // Read a token from the environment variables
        const token = process.env.SLACK_TOKEN;

        // Initialize
        const web = new WebClient(token);
        let messageC;
        try {
            console.log(JSON.parse(req.body.payload))

            messageC = JSON.parse(req.body.payload)
        } catch (error) {
            messageC = req.body.payload
        }


        await web.chat.postMessage({
            channel: messageC.container.channel_id,
            text: "Answering your question, loading ...",
        });
        answerQuestion(web, messageC);


        res.status(200).json({});
    } catch (error) {
        console.log("error")
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}