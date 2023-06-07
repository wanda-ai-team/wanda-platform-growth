// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
    Configuration,
} from "openai";
import { OpenAI } from "langchain/llms";
import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from "langchain/prompts";
import getDBEntry from "@/utils/api/db/getDBEntry";
import createDBEntry from "@/utils/api/db/createDBEntry";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});



export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const text = JSON.parse(req.body).text;
        const newF = JSON.parse(req.body).newF;
        let url = JSON.parse(req.body).url;
        if (url !== "null") {
            url = url.replace("www.", "");
            url = url.replace("https://", "");
        }
        /** Load the summarization chain. */
        let resSummarization;
        console.log("Loading summarization chain...");
        try {
            let summary = [];
            if (newF) {

                if (url !== "null") {
                    summary = await getDBEntry("summaries", ["url"], ["=="], [url], 1);
                }
                if (summary.length > 0) {
                    return res.status(200).json({
                        name: "",
                        content: summary[0].data.summary,
                        success: true,
                    } as { name: string; content: string; format: string; success: boolean });
                }
                else {
                    return res.status(200).json({
                        name: "",
                        content: "",
                        success: false,
                    } as { name: string; content: string; format: string; success: boolean });
                }

            }
            else {
                console.log(text)
                createDBEntry("summaries", { url: url, summary: text })

                return res.status(200).json({
                    name: "",
                    content: text,
                    success: true,
                } as { name: string; content: string; format: string; success: boolean });
            }

        } catch (e) {
            console.log(e);
        }

        return res.status(200).json({
            name: "",
            content: "",
            success: false,
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