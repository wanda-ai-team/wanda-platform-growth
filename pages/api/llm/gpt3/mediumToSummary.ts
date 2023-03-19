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

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const mediumText = (<string>req.body.mediumText);
        const model = new OpenAI({ temperature: 0 });
        /** Load the summarization chain. */
        let res1;
        try {
            const combineDocsChain = loadSummarizationChain(model);
            console.log(combineDocsChain);

            /** Pass this into the AnalyzeDocumentChain. */
            const chain = new AnalyzeDocumentChain({
                combineDocumentsChain: combineDocsChain,
            });

            res1 = await chain.call({
                input_document: mediumText,
            });
        } catch (e) {
            console.log(e);
        }

        console.log(res1);

        // console.log('Encoded this string looks like: ', encoded.length)

        return res.status(200).json({
            name: "",
            content: res1 !== undefined ? res1.text : "",
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
