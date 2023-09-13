import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { content } = req.body

    await axios.post(process.env.BACKEND_URL + '/llmTools/vectorDBQuery', {
        userPrompt: content,
        systemPrompt: "",
        config: {
            "output": "",
            "tone":"",
            "url": "",
            "writing": ""
        }
    },
        {
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${123}`
            }
        }
    );

}