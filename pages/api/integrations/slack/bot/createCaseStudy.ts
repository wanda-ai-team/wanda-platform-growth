
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

        console.log("sendSlackMessage");
        console.log(req.body);
        
        console.log(req.body.payload);
        console.log(JSON.parse(req.body.payload))
        
        let messageC = JSON.parse(req.body.payload)

        switch (messageC.type) {
            case "message_action":
                console.log("message_action");
                
                console.log(messageC.message.blocks[2].text.text);
                console.log(messageC.message.blocks);
                const responseOpenAI = await openAICall(false, "Create me a study case based on the give topics that were talked about during the client meeting\n Topics:" + messageC.message.blocks[2].text.text, "You are a professional customer success manager");
                console.log(responseOpenAI);
                const response = await web.chat.postMessage({
                    channel: "C061MT4UL05",
                    text: responseOpenAI,
                });
                console.log(response);
                break
            case "block_actions":
                // const responseOpenAI = await openAICall(false, "userContent", "systemContent");
                (async () => {
                    const response = await web.chat.postMessage({
                        channel: "C061MT4UL05",
                        text: "Hello there",
                    });
                    console.log(response);
                })();
                break
        }


        res.status(200).json({ content: "No data found", success: false });
    } catch (error) {
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}