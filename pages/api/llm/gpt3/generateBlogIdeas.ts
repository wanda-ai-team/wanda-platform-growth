// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { Configuration, OpenAIApi } from 'openai';


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { idea } = req.body

    console.log("idea")
    console.log(idea)

    const openAIResult = await getOpenAIAnswer(idea)

    res.status(200).json({ data: openAIResult })

}

export const getOpenAIAnswer = async (context: string) => {
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
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
    });

    const result = completion.data.choices[0].message?.content || "No results"

    return result
}
