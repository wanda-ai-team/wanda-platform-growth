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
        const mediumText = (<string>req.query.mediumText);
        let basePromptPrefix = "";

        //Prompt for the GPT-3 model - 17 Tokens
        basePromptPrefix = `
Create me a Twitter thread based on the summary of this Medium Blog Post:\n
${mediumText}\n
Twitter Thread:\n`;

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: basePromptPrefix }],
            temperature: 0.7,
        });

        return res.status(200).json({
            name: "",
            content: completion.data.choices[0].message?.content,
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
