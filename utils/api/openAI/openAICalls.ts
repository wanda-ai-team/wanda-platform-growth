import { OpenAIStream } from "@/pages/api/llm/gpt3/openAIStream";
import { getGenerateIdeasX, getGenerateIdeasBlog, getGenerationToBlogPrompt, getGenerationToXPrompt, getLandingPageScrapePrompt, getGenerateTestX, getGenerateTestBlog, getGenerateLandingPage } from "@/utils/globalPrompts";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from 'openai';


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function getOpenAIAnswer(context: string, platform: string, streamB = false, contextuser = "") {
    let userContent = ``
    let systemContent = ``

    switch (platform.toLocaleLowerCase()) {
        case "twitter":
            userContent = getGenerateIdeasX(context);
            systemContent = `You are a professional ${platform} writter at a SaaS company. ${platform.toLocaleLowerCase() === `blog` ? `Only respond in Markdown format` : ``}.`
            break;
        case "blog":
            userContent = getGenerateIdeasBlog(context);
            systemContent = `You are a professional ${platform} writter at a SaaS company. ${platform.toLocaleLowerCase() === `blog` ? `Only respond in Markdown format` : ``}.`
            break;
        case "twitter-generation":
            userContent = getGenerateTestX(context, contextuser);
            systemContent = `You are a professional content creator. You know how to write a Twitter that can go viral.`
            break;
        case "blog-generation":
            userContent = getGenerateTestBlog(context, contextuser);
            systemContent = `Act as a content marketing specialist. I will provide you with a specific task. Your task is to generate a highly converting and appealing blog posts. Only respond in Markdown format`
            break;
        case "landing-page":
            userContent = getLandingPageScrapePrompt(context);
            systemContent = `You are a senior marketing expert at a SaaS company. Only respond in JSON format.`
            break;
        case "landing-page-copy":
            userContent = getGenerateLandingPage(context, contextuser, context);
            systemContent = `You are an expert landing page creator.`
            break;

    }

    return await openAICall(streamB, userContent, systemContent)
}

async function openAICall(streamB: boolean, userContent: string, systemContent: string) {

    if (streamB) {

        console.log({ userContent })
        const payload = {
            model: "gpt-4",
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            messages: [{ role: "user", content: userContent }],
            stream: true,
        };
        const stream = await OpenAIStream(payload);
        return new NextResponse(stream);
    }
    else {


        try {
            const completion = await openai.createChatCompletion({
                model: "gpt-4",
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

            let result = completion.data.choices[0].message?.content || "No results"
            try {
                if (result.includes(`\``)) {
                    result = result.replaceAll('\`', '')
                }
                if (result.includes(`json`)) {
                    result = result.replace(`json`, '')
                }

                if (result.includes(`markdown`)) {
                    result = result.replace(`markdown`, '')
                }
                console.log(typeof result)
                const parsedResult: any = JSON.parse(result) ? JSON.parse(result) : result
                return parsedResult
            } catch (error) {
                console.log({ error })
                return result
            }
        } catch (error) {
            console.log({ error })
            return null
        }
    }
}

export {
    getOpenAIAnswer,
    openAICall
};