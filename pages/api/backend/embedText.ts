import { embedText } from "@/utils/api/backend/backendCalls";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let { content } = req.body
    const { company } = req.body
    const { typeOfContent } = req.body
    const { url } = req.body
    return await axios.post(process.env.BACKEND_URL + '/llmTools/embedText', {
        userPrompt: content,
        systemPrompt: "",
        config: {
            "company": company,
            "typeOfContent": typeOfContent,
            "url": url
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