// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";

import { OpenAIStream } from "./openAIStream";
import { getGenerateLandingPage, getTextToBlogPostPrompt, getTextToInstagramCarrouselTextPrompt, getTextToLinkedInPostPrompt, getTextToTwitterThreadPrompt, textToTwitterThreadPrompt } from "@/utils/globalPrompts";
import { load } from "cheerio";


export const config = {
    runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
    let { text, output, outputO, isText, toneStyle, writingStyle, landingPageContext, landingPageContent } = (await req.json()) as {
        text?: string;
        output?: string;
        outputO?: string;
        isText?: boolean;
        toneStyle?: string;
        writingStyle?: string;
        landingPageContext?: string;
        landingPageContent?: string;
    };
    if (!output || !text || !outputO || isText === undefined || toneStyle === undefined || writingStyle === undefined || landingPageContent === undefined || landingPageContext === undefined) {
        console.log("error");
        console.log(output, text, outputO, isText, toneStyle, writingStyle, landingPageContent, landingPageContext);
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
                    basePromptPrefix =
                        getTextToLinkedInPostPrompt(toneStyle, writingStyle) + `
Summary: ${text}\n
Linkedin Post:\n`;
                }
                break;
            case "blog":
                if (outputO === "post" || outputO === "thread") {
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
            case "landing page":
                    basePromptPrefix =
                        getGenerateLandingPage(landingPageContent, landingPageContext, text);
                
                break;
            default:
                break;
        }


        const payload = {
            model: "gpt-4-1106-preview",
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            messages: [{ role: "user", content: basePromptPrefix }],
            stream: true,
        };

        const stream = await OpenAIStream(payload);
        console.log(stream);
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