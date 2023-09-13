import { getGenerateIdeasX, getGenerateIdeasBlog } from "@/utils/globalPrompts";

import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function getOpenAIAnswer(context: string, platform: string) {
    let userContent = ``
    switch (platform.toLocaleLowerCase()) {
        case "twitter":
            userContent = getGenerateIdeasX(context);
            break;
        case "Blog":
            userContent = getGenerateIdeasBlog(context);
            break;
    }
    let systemContent = `You are a professional ${platform} writter at a SaaS company. ${platform.toLocaleLowerCase() === `blog` ? `Only respond in Markdown format` : ``}.`

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        messages: [{
            role: "system", content: systemContent,
        }, {
            role: "user", content: userContent
        }],
    });
    const result = completion.data.choices[0].message?.content || "No results"

    console.log({ result })

    try {
        const parsedResult: any = JSON.parse(result)

        console.log({ parsedResult })
        return parsedResult
    } catch (error) {
        console.log({ error })
        return result
    }
}

export {
    getOpenAIAnswer
};