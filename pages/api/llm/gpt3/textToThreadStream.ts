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
    let { text, output, outputO, isText, toneStyle } = (await req.json()) as {
        text?: string;
        output?: string;
        outputO?: string;
        isText?: boolean;
        toneStyle?: string;
    };
    if (!output || !text || !outputO || isText === undefined) {
        return new Response('Bad Request', { status: 400 });
    }
    try {
        output = output.toLowerCase();
        outputO = outputO.toLowerCase();
        let basePromptPrefix = "";

        switch (output) {
            case "twitter":
                if (outputO === "thread") {
                    basePromptPrefix =
                        textToTwitterThreadPrompt + `
${toneStyle ? `Use this tone and/or quality toneStyle: ${toneStyle}\n` : ''}
Summary: ${text}\n
Twitter Thread:\n`;
                }
                break;
            case "instagram":
                if (outputO === "post") {
                    basePromptPrefix =
                        textToInstagramCarrouselTextPrompt + `
${toneStyle ? `Use this tone and/or quality toneStyle: ${toneStyle}\n` : ''}
Summary: ${text}\n
Instagram Carousel:\n`;
                }
                if (outputO === "carousel") {
                    console.log("linkedin carousel");
                    basePromptPrefix =
                        textToInstagramCarrouselTextPrompt + `
${toneStyle ? `Use this tone and/or quality toneStyle: ${toneStyle}\n` : ''}
Summary: ${text}\n
Instagram Carousel:\n`;

                }
                break;
            case "linkedin":
                if (outputO === "post") {
                    console.log("linkedin post");
                    basePromptPrefix =
                        textToLinkedInPostPrompt + `
${toneStyle ? `Use this tone and/or quality toneStyle: ${toneStyle}\n` : ''}
Summary: ${text}\n
Linkedin Post:\n`;
                }
                break;
            case "blog":
                if (outputO === "post") {
                    basePromptPrefix =
                        textToBlogPostPrompt + `
${toneStyle ? `Use this tone and/or quality toneStyle: ${toneStyle}\n` : ''}
Summary: ${text}\n
Blog Post:\n`;
                }
                break;
            case "blog":
                if (outputO === "article") {
                    basePromptPrefix =
                        textToBlogPostPrompt + `
${toneStyle ? `Use this tone and/or quality toneStyle: ${toneStyle}\n` : ''}
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