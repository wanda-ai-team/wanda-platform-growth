// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
    Configuration,
} from "openai";
import { OpenAI } from "langchain/llms";
import { LLMChain, loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from "langchain/prompts";
import getDBEntry from "@/utils/api/db/getDBEntry";
import createDBEntry from "@/utils/api/db/createDBEntry";

const { spawn } = require('child_process');
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
        if (url !== "null") {
            url = url.replace("www.", "");
            url = url.replace("https://", "");
        }
        console.log("olaaaaaaaa")
        const model = new OpenAI({ temperature: 0 });
        /** Load the summarization chain. */
        let resSummarization;
        try {
            let summary = [];
            if (url !== "null") {
                summary = await getDBEntry("summaries", ["url"], ["=="], [url + '4'], 1);
            }

            if (summary.length > 0) {
                return res.status(200).json({
                    name: "",
                    content: summary[0].data.summary,
                    success: true,
                } as { name: string; content: string; format: string; success: boolean });
            }
            else {
                /* Split the text into chunks. */

                // var dataToSend: any;
                // // spawn new child process to call the python script
                // const python = spawn('python', ['pages/api/llm/gpt3/script1.py']);
                // // collect data from script
                // await python.stdout.on('data', function (data: { toString: () => any; }) {
                //     console.log('Pipe data from python script ...');
                //     dataToSend = data.toString();
                // });
                // python.stderr.on('data', (data: { toString: (arg0: string) => any; }) => {
                //     console.error('stderr: ', data.toString('utf8'));
                // })
                // // in close event we are sure that stream from child process is closed
                // await python.on('close', (code: any) => {
                //     console.log(`child process close all stdio with code ${code}`);
                //     // send data to browser
                //     console.log(dataToSend)
                // });


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

                const chainS = new LLMChain({ llm: model, prompt });

                resSummarization = await chainS.call({
                    text: docs
                });


                createDBEntry("summaries", { url: url, summary: resSummarization.text })
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
