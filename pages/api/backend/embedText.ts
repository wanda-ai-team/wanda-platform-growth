import { embedText } from "@/utils/api/backend/backendCalls";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { content } = req.body
    const { type } = req.body

    await axios.post(process.env.BACKEND_URL + '/llmTools/embedText', {
        userPrompt: content,
        systemPrompt: "",
        config: {
            "index": type,
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