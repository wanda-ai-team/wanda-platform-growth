// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { retreiveCallTranscript } from "@/utils/common/integrations/integrationsURLs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const { callId } = req.body

    const URL = process.env.GONG_URL + retreiveCallTranscript;
    let data = process.env.GONG_ACCESS_KEY + ":" + process.env.GONG_ACCESS_SECRET;
    let buff = new Buffer(data);
    let base64data = buff.toString('base64');

    // Set the headers for the request, including the API token and content type
    const headers = {
        authorization: "Basic " + base64data,
        "content-type": "application/json",
    };

    const body = {
        "filter": {
            "callIds": callId
        },
    }

    // Send a POST request to the transcription API with the audio URL in the request body
    const response = await fetch(URL, {
        method: "POST",
        body: JSON.stringify(body),
        headers,
    }).then((response) => response.json())
        .then((data) => {
            if (data.callTranscripts.length > 0) {
                return data.callTranscripts[0].transcript
            } else {
                return null
            }
        })

    let transcript = response.map((item: any) => item.sentences.map((sentence: any) => sentence.text))
    transcript = transcript.join(" ")



    if (response !== null) {
        res.status(200).json({ content: transcript, success: true });
    }
    else {
        res.status(400).json({ content: "No data found", success: false });
    }
}