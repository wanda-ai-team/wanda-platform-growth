import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

import { OpenAIStream, StreamingTextResponse } from 'ai'

export const config = {
    runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
    const body = await req.json()

    const { messages } = body
    const { user } = body
    if (messages.length == 0) {

        return new Response(null)
    }

    try {
        const response = await fetch(process.env.BACKEND_URL + '/llmTools/streamChat', {
            method: 'POST', 
            body: JSON.stringify({
                userPrompt: messages,
                systemPrompt: "",
                config: {
                }
            }),
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${123}`
            }
        }
        );

        console.log(response.body)

        return new Response(response.body)
    } catch (error) {
        console.log(error)
        return new Response(null)
    }

}
export default handler