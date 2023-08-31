// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { Configuration, OpenAIApi } from 'openai';
import { OpenAIStream } from './openAIStream';


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
export const config = {
    runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
    let { idea } = (await req.json()) as {
        idea?: string;
    };

    return await getOpenAIAnswer(idea)

}

export const getOpenAIAnswer = async (context = "") => {
    const payload = {
        model: "gpt-4",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        messages: [{
            role: "system", content: "You are a professional blog writter at a SaaS company. Only respond in Markdown format.",
        }, {
            role: "user", content: `This is the main topic that you will base your new blog post on: ${context}. 
    Based on this idea for a blog, write a blog post of about 1,500 words, make it be SEO relevant.
    Provide a blog compliant markdown response following the correct format.`
        }],
        stream: true,
    };
    const stream = await OpenAIStream(payload);
    return new Response(stream);
}

export default handler;