// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";

import { getGenerateLandingPage, getTextToBlogPostPrompt, getTextToInstagramCarrouselTextPrompt, getTextToLinkedInPostPrompt, getTextToTwitterThreadPrompt, textToTwitterThreadPrompt } from "@/utils/globalPrompts";
import { load } from "cheerio";

import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
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
        // Ask OpenAI for a streaming completion given the prompt
        const response = await openai.createChatCompletion({
            model: 'gpt-4',
            stream: true,
            messages: [
                {
                    role: 'user',
                    content: `Generate a twitter thread and clearly labeled each tweet with "1.", "2.", "3.", "4." and so on. 
          Make sure that each tweet as less than 280 characters, has short sentences that are found in Twitter threads, and has a clear structure. `,
                },
            ],
        });

        // Convert the response into a friendly text-stream
        const stream = OpenAIStream(response);
        // Respond with the stream
        return new StreamingTextResponse(stream);

    } catch (e: any) {
        console.log("error", e);
        return new Response(e, { status: 500 });
    }
}
