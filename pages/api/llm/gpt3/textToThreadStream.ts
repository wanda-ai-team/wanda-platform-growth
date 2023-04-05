// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { textToBlogPostPrompt, textToInstagramCarrouselTextPrompt, textToLinkedInPostPrompt, textToTwitterThreadPrompt } from "@/utils/globalPrompts";
import type { NextApiRequest, NextApiResponse } from "next";
import {
    Configuration,
    OpenAIApi,
} from "openai";
import { OpenAIStream } from "./openAIStream";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
    runtime: "edge",
};



const openai = new OpenAIApi(configuration);

const handler = async (req: Request): Promise<Response> => {
    let { text, output} = (await req.json()) as {
        text?: string;
        output?: string;
    };
    if (!output || !text) {
        return new Response('Bad Request', { status: 400 });
    }

    console.log("text", text);
    console.log("output", output);
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let counter = 0;
    try {
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
            case "test":
                basePromptPrefix =
                    textToBlogPostPrompt + `
Summary: ${text}\n
Blog Post:\n`;
                break;
            default:
                break;
        }

        const payload = {
            model: "text-davinci-003",
            prompt: basePromptPrefix,
            temperature: 0.7,
            max_tokens: 1024,
            stream: true,
            n: 1,
        };

        const stream = await OpenAIStream(payload);
        return new Response(stream);
        console.log("stream");
        // return res.status(200).send(stream);
        // // return new Response(stream).status(200);
        // return res.status(200).json({
        //     stream: stream,
        //     success: true,
        // } as {
        //     stream: any;
        //     success: boolean;
        // });

        // const completion = await openai.createChatCompletion({
        //     model: "gpt-4",
        //     messages: [{ role: "user", content: basePromptPrefix }],
        //     temperature: 0.7,
        // });

        // const finalTweet = completion.data.choices[0].message?.content;

        // return res.status(200).json({
        //     name: "",
        //     content: finalTweet,
        //     success: true,
        // } as { name: string; content: string; format: string; success: boolean });
    } catch (e: any) {
        console.log("error", e);
        return new Response(e, { status: 500 });
    }
}

export default handler;