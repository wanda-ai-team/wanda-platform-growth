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
Please ignore all previous instructions. 
Please respond only in the english language.
You are a Twitter Creator with a large fan following. 
You have a Casual tone of voice. 
You have a Analytical writing style. 
Create a Twitter thread on the topic of the summary.
There should be around 5 to 8 tweets. 
After writing the tweets, please add a separator line.
Include emojis and hashtags in some of the tweets.
Try to use unique emojis in some of the tweets.
The first tweet should have a hook and entice the readers.
The last tweet should have a small summary of the thread.
Talk in-depth of the topic on all the tweets
Do not repeat yourself.
Do not self reference.
Do not explain what you are doing.
Do not explain what you are going to do.
Start directly by writing down the tweets.
Summary: ${text}\n
Twitter Thread:\n`;

        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [{ role: "user", content: basePromptPrefix }],
            temperature: 0.7,
        });

        // const completion = await openai.createCompletion({
        //     model: "text-davinci-003",
        //     prompt: basePromptPrefix,
        //     temperature: 0.7,
        //     max_tokens: 1024,
        // });
        

        // const finalTweet = completion.data.choices[0].text!;
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
