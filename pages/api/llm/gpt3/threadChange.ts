// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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
        const tweet1 = (<string>req.query.tweet);
        let basePromptPrefix = "";

        //Prompt for the GPT-3 model - 17 Tokens
        basePromptPrefix = `
Please ignore all previous instructions. 
Please respond only in the english language.
You are a Twitter Creator with a large fan following.
Rewrite the following tweet, that belongs to a thread.
The rewritten tweet should follow this new style: ${text}
Tweet: ${tweet1}`;

        // const completion = await openai.createChatCompletion({
        //     model: "gpt-4",
        //     messages: [{ role: "user", content: basePromptPrefix }],
        //     temperature: 0.7,
        // });

        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [{ role: "user", content: basePromptPrefix }],
            temperature: 0.7,
        });

        // const finalTweet = completion.data.choices[0].text!.trim();
        const finalTweet = completion.data.choices[0].message?.content;
        console.log(finalTweet);

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
