// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getGenerationToBlogPrompt, getGenerationToXPrompt } from '@/utils/globalPrompts';
import { OpenAIStream } from './openAIStream';

export const config = {
    runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
    let { idea, platform } = (await req.json()) as {
        idea?: string;
        platform?: string;
    };

    return await getOpenAIAnswer(idea, platform)
}

export const getOpenAIAnswer = async (context = "", platform = "twitter") => {
    let userContent = ``
    switch (platform) {
        case "Twitter":
            userContent = getGenerationToXPrompt(context);
            break;
        case "Blog":
            userContent = getGenerationToBlogPrompt(context);
            break;
    }
    let systemContent = `You are a professional ${platform} writter at a SaaS company. ${platform === `Blog` ? `Only respond in Markdown format`: ``}.`
    const payload = {
        model: "gpt-4",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        messages: [{
            role: "system", content: systemContent
        }, {
            role: "user", content: userContent
        }],
        stream: true,
    };

    const stream = await OpenAIStream(payload);
    return new Response(stream);
}

export default handler;