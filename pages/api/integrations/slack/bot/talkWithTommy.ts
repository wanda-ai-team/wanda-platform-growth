
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';
import { answerQuestion } from "@/utils/api/integrations/slack/bot";
import axios from "axios";

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

        // if(!messageC.channel_name.includes("talk-with-")) {
        //     return res.status(200).json("Expert needs to called in the specific channel talk-with-...");
        // }

        await web.chat.postMessage({
            channel: messageC.channel_id,
            // text: messageC.channel_name.split("talk-with-")[1] + " is answering \" " + messageC.text + "\", loading ...",
            text: "Tommy is answering \" " + messageC.text + "\", loading ...",
        });

        (async () => {
            const response = await axios.post(process.env.BACKEND_URL + '/llmTools/assistant/createWithGoogle', {
                userPrompt: messageC.text,
                systemPrompt: "",
                config: {
                    "output": "",
                    "tone": "",
                    "url": "",
                    "writing": ""
                }
            },
                {
                    headers: {
                        "content-type": "application/json",
                        "Authorization": `Bearer ${123}`
                    }
                }
            );

            console.log(response.data)
    
            await web.chat.postMessage({
                channel: messageC.channel_id,
                // text: messageC.channel_name.split("talk-with-")[1] + " is answering \" " + messageC.text + "\", loading ...",
                text: response.data,
            });
        })();


        
        // await answerQuestion(web, messageC);

        return res.status(200).json("Question being answered!");
    } catch (error) {
        console.log("error")
        console.log(error)
        return res.status(400).json({ content: error, success: false });
    }
}