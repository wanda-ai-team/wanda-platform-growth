// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import updateDBEntry from "@/utils/api/db/updateDBEntry";
import { retrieveCallsByDate } from "@/utils/common/integrations/integrationsURLs";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const allUsers = await getDBEntry("users", ["email"], ["!="], [""], 1);

    for (let index = 0; index < allUsers.length; index++) {
        const currentUser = allUsers[index];
        console.log("currentUser");
        console.log(currentUser);
        if(currentUser.data.gongAccessToken !== undefined && currentUser.data.gongAccessToken !== "" && currentUser.data.gongAccessSecret !== undefined && currentUser.data.gongAccessSecret !== ""){
            let lastDate = currentUser.data.lastGongCallDate !== undefined ? currentUser.data.lastGongCallDate : "2018-02-18T08:00:00Z";
            const URL = process.env.GONG_URL + retrieveCallsByDate + "?fromDateTime=" + lastDate + "&toDateTime=" + "2024-12-25T22:00:00Z";
            console.log(URL);
            let data = currentUser.data.gongAccessToken + ":" + currentUser.data.gongAccessSecret;
            console.log(currentUser);
            let buff = Buffer.from(data);
            let base64data = buff.toString('base64');
            const headers = {
                authorization: "Basic " + base64data,
                "content-type": "application/json",
        
            };

            await fetch(URL, {
                method: "GET",
                headers,
            }).then((response) => response.json())
                .then(async (data) => {
                    console.log("data");
                    console.log(data);
                    console.log(data.calls);
                    let lastDate = data.calls[data.calls.length - 1].started
                    console.log(lastDate);
                    // await updateDBEntry("users", { lastGongCallDate: lastDate }, ['email'], '==', [currentUser.data.email], 1);
                    
                })
                .catch((error) => {
                    console.log(error);
                }
                );
        }
    }

    if (Object.keys({}).length > 0) {
        res.status(200).json({ content: "response", success: true });
    }
    else {
        res.status(400).json({ content: "No data found", success: false });
    }
}