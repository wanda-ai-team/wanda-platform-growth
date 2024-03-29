// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import { retreiveCallTranscript, retrieveCallInformationById, retrieveCallsByDate } from "@/utils/common/integrations/integrationsURLs";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const { callId } = req.body

    const URL = process.env.GONG_URL + retrieveCallInformationById;
    const URLTranscript = process.env.GONG_URL + retreiveCallTranscript;
    let data = process.env.GONG_ACCESS_KEY + ":" + process.env.GONG_ACCESS_SECRET;
    let buff = new Buffer(data);
    let base64data = buff.toString('base64');

    // Set the headers for the request, including the API token and content type
    const headers = {
        authorization: "Basic " + base64data,
        "content-type": "application/json",
    };

    let body = {
        "filter": {
            "callIds": callId
        },

        "contentSelector": {
            "context": "Extended",
            "contextTiming": [
                "Now"
            ],
            "exposedFields": {
                "parties": true,
                "content": {
                    "structure": true,
                    "topics": true,
                    "trackers": true,
                    "trackerOccurrences": true,
                    "pointsOfInterest": true
                },
                "interaction": {
                    "speakers": true,
                    "video": true,
                    "personInteractionStats": true,
                    "questions": true
                },
                "collaboration": {
                    "publicComments": true
                },
                "media": true
            }
        }
    }

    // Send a POST request to the transcription API with the audio URL in the request body
    const response = await fetch(URL, {
        method: "POST",
        body: JSON.stringify(body),
        headers,
    }).then((response) => response.json())
        .then((data) => {
            if (data.calls.length > 0) {
                return data.calls[0]
            } else {
                return null
            }
        })

    const body2 = {
        "filter": {
            "callIds": callId
        },
    }
    const transcriptR = await fetch(URLTranscript, {
        method: "POST",
        body: JSON.stringify(body2),
        headers,
    }).then((response) => response.json())
        .then((data) => {
            if (data.callTranscripts.length > 0) {
                return data.callTranscripts[0].transcript
            } else {
                return null
            }
        })
    let transcript = transcriptR.map((item: any) => item.sentences.map((sentence: any) => sentence.text))
    transcript = transcript.join(" ")
    response.transcript = transcript
    if (response !== null) {
        res.status(200).json({ content: response, success: true });
    }
    else {
        res.status(400).json({ content: "No data found", success: false });
    }
}