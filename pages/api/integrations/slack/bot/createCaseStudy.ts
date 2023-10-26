
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';
import { openAICall } from "@/utils/api/openAI/openAICalls";
import createDBEntry from "@/utils/api/db/createDBEntry";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        // Read a token from the environment variables
        const token = process.env.SLACK_TOKEN;

        // Initialize
        const web = new WebClient(token);
        console.log(JSON.parse(req.body.payload))

        let messageC = JSON.parse(req.body.payload)

        switch (messageC.type) {
            case "block_actions":
                await web.chat.postMessage({
                    channel: messageC.container.channel_id,
                    text: "Loading case study response ...",
                });
                const responseOpenAI = await openAICall(false, "Create me a study case based on the give topics that were talked about during the client meeting\n Topics:" + messageC.message.blocks[2].text.text, "You are a professional customer success manager");


                // createDBEntry("useCases", { content: responseOpenAI, title: "Case Study", type: "caseStudy" })

                const response = await web.chat.postMessage({
                    channel: messageC.container.channel_id,
                    text: responseOpenAI,
                });

                break
            case "message_action":
                // const responseOpenAI = await openAICall(false, "userContent", "systemContent");
                (async () => {
                    const response = await web.chat.postMessage({
                        channel: messageC.container.channel_id,
                        text: "Hello there",
                    });
                    console.log(response);
                })();
                break
        }

        res.status(200).json({ content: "Bot correctly answered", success: false });
    } catch (error) {
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}