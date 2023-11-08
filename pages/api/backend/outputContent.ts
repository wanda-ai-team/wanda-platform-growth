import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userPrompt } = req.body
    const { output } = req.body

    try {
        const response = await axios.post(process.env.BACKEND_URL + '/llmTools/outputContent', {
            userPrompt: userPrompt,
            systemPrompt: "",
            config: {
                "output": output
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