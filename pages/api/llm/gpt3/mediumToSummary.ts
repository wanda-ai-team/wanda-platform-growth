// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
    Configuration,
    OpenAIApi,
} from "openai";
const { encode, decode } = require('gpt-3-encoder')
const wrapText = require("wrap-text");
import { OpenAI } from "langchain/llms";
import { BaseChain, loadSummarizationChain } from "langchain/chains";
import { AnalyzeDocumentChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const mediumText = JSON.parse(req.body).mediumText;
        const model = new OpenAI({ temperature: 0 });
        /** Load the summarization chain. */
        let resSummarization;
        try {

            /* Split the text into chunks. */
            const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
            const docs = await textSplitter.createDocuments([mediumText]);
            /** Call the summarization chain. */
            const chainS = loadSummarizationChain(model);

            resSummarization = await chainS.call({
                input_documents: docs,
            });

            console.log("resSummarization");
            console.log(resSummarization);

            /** Pass this into the AnalyzeDocumentChain. */
            // const chain = new AnalyzeDocumentChain({
            //     combineDocumentsChain: combineDocsChain,
            // });

            // res1 = await chain.call({
            //     input_document: mediumText,
            // });
        } catch (e) {
            console.log(e);
        }

        // console.log('Encoded this string looks like: ', encoded.length)

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
