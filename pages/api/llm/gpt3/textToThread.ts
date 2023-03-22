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
        let basePromptPrefix = "";

        //Prompt for the GPT-3 model - 17 Tokens
        basePromptPrefix = `
Create me a Twitter thread based on this summary:\n
${text}\n
Twitter Thread:\n`;

        // const completion = await openai.createChatCompletion({
        //     model: "text-davinci-003",
        //     messages: [{ role: "user", content: basePromptPrefix }],
        //     temperature: 0.7,
        // });

        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: basePromptPrefix,
            temperature: 0.7,
            max_tokens: 2024,
        });


        const finalTweet = completion.data.choices[0].text!.split("\n\n");
        console.log(finalTweet);


        return res.status(200).json({
            name: "",
            content: finalTweet,
            success: true,
        } as { name: string; content: string[]; format: string; success: boolean });
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
