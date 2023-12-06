
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
            messageC = JSON.parse(req.body)
        } catch (error) {
            messageC = req.body
        }

        if(!messageC.channel_name.includes("talk-with-")) {
            return res.status(200).json("Expert needs to called in the specific channel talk-with-...");
        }

        await web.chat.postMessage({
            channel: messageC.channel_id,
            text: messageC.channel_name.split("talk-with-")[1] + " is answering \" " + messageC.text + "\", loading ...",
        });
        
        answerQuestion(web, messageC);

        return res.status(200).json("Question being answered!");
    } catch (error) {
        console.log("error")
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}