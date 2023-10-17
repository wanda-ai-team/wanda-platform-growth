// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import { retrieveCallsByDate } from "@/utils/common/integrations/integrationsURLs";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const URL = process.env.GONG_URL + retrieveCallsByDate + "?fromDateTime=" + "2018-02-18T08:00:00Z" + "&toDateTime=" + "2024-12-25T22:00:00Z";
    let data = process.env.GONG_ACCESS_KEY + ":" + process.env.GONG_ACCESS_SECRET;
    let buff = new Buffer(data);
    let base64data = buff.toString('base64');

    // Set the headers for the request, including the API token and content type
    const headers = {
        authorization: "Basic " + base64data,
        "content-type": "application/json",

    };

    // Send a POST request to the transcription API with the audio URL in the request body
    const response = await fetch(URL, {
        method: "GET",
        headers,
    }).then((response) => response.json())
        .then((data) => {
            console.log(data.calls);
            let callsData = {}
            if (data.calls.length > 0) {
                callsData = data.calls.map((call: any) => { return { title: call.title, id: call.id, meetingUrl: call.meetingUrl } })
            } else {
                console.log("No data found");
            }
            console.log(callsData);
            return callsData;
        })

    if (Object.keys(response).length > 0) {
        res.status(200).json({ content: response, success: true });
    }
    else {
        res.status(400).json({ content: "No data found", success: false });
    }
}