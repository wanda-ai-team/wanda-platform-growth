// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
    Configuration,
    OpenAIApi,
} from "openai";
import { OpenAIStream } from "./openAIStream";
import { getTextToBlogPostPrompt, getTextToInstagramCarrouselTextPrompt, getTextToLinkedInPostPrompt, getTextToTwitterThreadPrompt, textToTwitterThreadPrompt } from "@/utils/globalPrompts";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
    runtime: "edge",
};



const openai = new OpenAIApi(configuration);

const handler = async (req: Request): Promise<Response> => {
    let { text, output, outputO, isText, toneStyle, writingStyle } = (await req.json()) as {
        text?: string;
        output?: string;
        outputO?: string;
        isText?: boolean;
        toneStyle?: string;
        writingStyle?: string;
    };
    if (!output || !text || !outputO || isText === undefined || toneStyle === undefined || writingStyle === undefined) {
        return new Response('Bad Request', { status: 400 });
    }
    try {
        output = output.toLowerCase();
        outputO = outputO.toLowerCase();
        let basePromptPrefix = "";
        console.log(text)
        console.log(output)
        console.log(outputO)
        switch (output) {
            case "twitter":
                if (outputO === "thread") {
                    basePromptPrefix =
                        getTextToTwitterThreadPrompt(toneStyle, writingStyle) + `
Summary: ${text}\n
Twitter Thread:\n`;
                }
                break;
            case "instagram":
                if (outputO === "post") {
                    basePromptPrefix =
                        getTextToInstagramCarrouselTextPrompt(toneStyle, writingStyle) + `
Summary: ${text}\n
Instagram Carousel:\n`;
                }
                if (outputO === "carousel") {
                    basePromptPrefix =
                        getTextToInstagramCarrouselTextPrompt(toneStyle, writingStyle) + `
Summary: ${text}\n
Instagram Carousel:\n`;

                }
                break;
            case "linkedin":
                if (outputO === "post") {
                    console.log("linkedin post");
                    basePromptPrefix =
                        getTextToLinkedInPostPrompt(toneStyle, writingStyle) + `
Summary: ${text}\n
Linkedin Post:\n`;
                }
                break;
            case "blog":
                if (outputO === "post") {
                    basePromptPrefix =
                        getTextToBlogPostPrompt(toneStyle, writingStyle) + `
Summary: ${text}\n
Blog Post:\n`;
                }
                if (outputO === "article") {
                    basePromptPrefix =
                        getTextToBlogPostPrompt(toneStyle, writingStyle) + `
Summary: ${text}\n
Blog Post:\n`;
                }
                break;
            default:
                break;
        }

        const payload = {
            model: "gpt-4",
            // model: "text-davinci-003",
            // prompt: basePromptPrefix,
            messages: [{ role: "user", content: basePromptPrefix }],
            temperature: 0.7,
            stream: true,
            n: 1,
        };

        const stream = await OpenAIStream(payload);
        return new Response(stream);
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