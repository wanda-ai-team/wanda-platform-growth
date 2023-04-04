// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
    Configuration,
} from "openai";
import { OpenAI } from "langchain/llms";
import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from "langchain/prompts";
import updateDBEntry from "@/utils/api/db/createDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});



export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const docsT = JSON.parse(req.body).text;
        let url = JSON.parse(req.body).url;
        url = url.replace("www.", "");
        url = url.replace("https://", "");
        const model = new OpenAI({ temperature: 0 });
        /** Load the summarization chain. */
        let resSummarization;
        try {


            const summary = await getDBEntry("summaries", ["url"], ["=="], [url], 1);

            if (summary.length > 0) {
                return res.status(200).json({
                    name: "",
                    content: summary[0].data.summary,
                    success: true,
                } as { name: string; content: string; format: string; success: boolean });
            }
            else {
                /* Split the text into chunks. */
                const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
                const template = `Create a long and in-depth summary, that should touch all the important points about: 
            {text}
            SUMMARY: `;

                const docs = await textSplitter.createDocuments([docsT]);
                /** Call the summarization chain. */

                const model = new OpenAI({ temperature: 0 });

                const prompt = new PromptTemplate({
                    inputVariables: ["text"],
                    template: template,
                });

                const chainS = loadSummarizationChain(model,
                    {
                        prompt: prompt,
                        type: "map_reduce"
                    });



                resSummarization = await chainS.call({
                    input_documents: docs
                });


                updateDBEntry("summaries", { url: url, summary: resSummarization.text })
            }

        } catch (e) {
            console.log(e);
        }

        return res.status(200).json({
            name: "",
            content: resSummarization !== undefined ? resSummarization.text : "",
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
