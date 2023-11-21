
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
            console.log(JSON.parse(req.body.text))
            console.log(JSON.parse(req.body.channel_id))

            messageC = JSON.parse(req.body)
        } catch (error) {
            messageC = req.body
        }

        console.log(messageC)

        await web.chat.postMessage({
            channel: messageC.channel_id,
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