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

    console.log("body", {
        userPrompt: content,
        systemPrompt: "",
        config: {
            "company": company,
            "typeOfContent": typeOfContent,
            "url": url
        }
    })
    const response = await axios.post(process.env.BACKEND_URL + '/llmTools/embedText', {
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

    console.log("response", response)
    return res.status(200).json(response.data);

}