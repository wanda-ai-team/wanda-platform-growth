// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import { retrieveCallsByDate } from "@/utils/common/integrations/integrationsURLs";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { checkIfTokenNeedsRefresh } from "@/utils/common/integrations/gong/checkIfTokenNeedsRefresh";
import { refreshToken } from "@/utils/common/integrations/gong/refreshToken";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const session = await getServerSession(req, res, authOptions)
    // Error handling

    if (!session?.user || !session?.user?.email) {
        return res.status(401).json({
            error: {
                code: "no-access",
                message: "You are not signed in.",
            },
        });
    }

    if(await checkIfTokenNeedsRefresh(session.user.email)){
        console.log("refreshing token");
        await refreshToken(session.user.email);
    }

    const user = await getDBEntry("users", ["email"], ["=="], [session.user.email], 1);
    const gongAccessToken = user[0].data.gongAccessToken;
    
    const URL = process.env.GONG_URL + retrieveCallsByDate + "?fromDateTime=" + "2018-02-18T08:00:00Z" + "&toDateTime=" + "2024-12-25T22:00:00Z";

    // Set the headers for the request, including the API token and content type
    const headers = {
        authorization: "Bearer " + gongAccessToken,
        "content-type": "application/json",

    };

    // Send a POST request to the transcription API with the audio URL in the request body
    const response = await fetch(URL, {
        method: "GET",
        headers,
    }).then((response) => response.json())
        .then((data) => {
            let callsData = []
            if (data.calls.length > 0) {
                callsData = data.calls.map((call: any) => { return { title: call.title, id: call.id, meetingUrl: call.meetingUrl, started: call.started } })
                callsData = callsData.sort((a: any, b: any) => { return new Date(b.started).getTime() - new Date(a.started).getTime() })
            } else {
                console.log("No data found");
            }
            return callsData;
        }).catch((error) => {
            console.log(error);
            
            return null;
        })

    if(response === null){
        res.status(400).json({ content: "No authorization", success: false });
        return;
    }

    if (response !== null && Object.keys(response).length > 0) {
        res.status(200).json({ content: response, success: true });
    }
    else {
        res.status(400).json({ content: "No calls", success: false });
    }
}