import { OpenAI } from "langchain/llms/openai";
import { ZapierNLAWrapper } from "langchain/tools";
import {
    initializeAgentExecutorWithOptions,
    ZapierToolKit,
} from "langchain/agents";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log("olaaa")
    const model = new OpenAI({ temperature: 0 });
    const zapier = new ZapierNLAWrapper();
    const toolkit = await ZapierToolKit.fromZapierNLAWrapper(zapier);

    const executor = await initializeAgentExecutorWithOptions(
        toolkit.tools,
        model,
        {
            agentType: "zero-shot-react-description",
            verbose: true,
        }
    );
    console.log("Loaded agent.");

    const textI = <string>req.query.textI;
    const input = textI;

    console.log(`Executing with input "${input}"...`);

    const result = await executor.call({ input });

    console.log(`Got output ${result.output}`);

    return res.status(200).json({
        content: result,
        success: true,
    });
}
