// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { textToBlogPostPrompt, textToInstagramCarrouselTextPrompt, textToLinkedInPostPrompt, textToTwitterThreadPrompt } from "@/utils/globalPrompts";
import type { NextApiRequest, NextApiResponse } from "next";
import {
    Configuration,
    OpenAIApi,
} from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const text = (<string>req.query.text);
        let output = (<string>req.query.output);
        output = output.toLowerCase();
        let basePromptPrefix = "";

        switch (output) {
            case "twitter":
                basePromptPrefix = 
textToTwitterThreadPrompt + `
Summary: ${text}\n
Twitter Thread:\n`;
                break;
            case "instagram":
                basePromptPrefix = 
textToInstagramCarrouselTextPrompt + `
Summary: ${text}\n
Instagram Carousel:\n`;
                break;
            case "linkedin":
                basePromptPrefix = 
textToLinkedInPostPrompt + `
Summary: ${text}\n
Linkedin Post:\n`;
                break;
            case "blog":
                basePromptPrefix = 
textToBlogPostPrompt + `
Summary: ${text}\n
Blog Post:\n`;
                break;
            default:
                break;
        }

        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [{ role: "user", content: basePromptPrefix }],
            temperature: 0.7,
        });

        const finalTweet = completion.data.choices[0].message?.content;

        return res.status(200).json({
            name: "",
            content: finalTweet,
            success: true,
        } as { name: string; content: string; format: string; success: boolean });
    } catch (e: any) {
        console.log(e);
        let message =
            e.response.data.message !== undefined ? e.response.data.message : "";
        return res.status(400).json({
            name: "",
            reason: e.response !== undefined ? message : "",
            success: false,
        } as {
            name: string;
            reason: string;
            success: boolean;
        });
    }
}
