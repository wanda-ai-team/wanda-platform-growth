// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import updateDBEntry from "@/utils/api/db/updateDBEntry";
import { checkIfTokenNeedsRefresh } from "@/utils/common/integrations/gong/checkIfTokenNeedsRefresh";
import { refreshToken } from "@/utils/common/integrations/gong/refreshToken";
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
        if (currentUser.data.gongAccessToken !== undefined && currentUser.data.gongAccessToken !== "") {
            if (await checkIfTokenNeedsRefresh(currentUser.data.email)) {
                await refreshToken(currentUser.data.email);
            }
            let lastDate = currentUser.data.lastGongCallDate !== undefined ? currentUser.data.lastGongCallDate : "2018-02-18T08:00:00Z";
            
            lastDate = "2023-10-20T06:50:31.174851-07:01"
            const URL = process.env.GONG_URL + retrieveCallsByDate + "?fromDateTime=" + lastDate + "&toDateTime=" + "2024-12-25T22:00:00Z";
            const headers = {
                authorization: "Bearer " + currentUser.data.gongAccessToken,
                "content-type": "application/json",
            };

            await fetch(URL, {
                method: "GET",
                headers,
            }).then((response) => response.json())
                .then(async (data) => {
                    if(data.calls === undefined){
                        return
                    }
                    let callsData = data.calls.sort((a: any, b: any) => { return new Date(b.started).getTime() - new Date(a.started).getTime() })
                    callsData = callsData.filter((call: any) => { return call.started > lastDate })
                    let lastDateF = callsData[0].started
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