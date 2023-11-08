import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { content } = req.body

    try {
        const response = await axios.post(process.env.BACKEND_URL + '/llmTools/summarize', {
            userPrompt: content,
            systemPrompt: "",
            config: {
                "output": "",
                "tone": "",
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


        res.status(200).json({ content: response.data, success: true })
    } catch (error) {
        console.log(error)
        res.status(200).json({ content: "Error", success: false })
    }

}