// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import updateDBEntry from "@/utils/api/db/updateDBEntry";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions)
    // Error handling

    try {

        if (!session?.user || !session?.user?.email) {
            return res.status(401).json({
                error: {
                    code: "no-access",
                    message: "You are not signed in.",
                },
            });
        }

        const { code } = req.body;
        if (!code) {
            return new Response('Bad Request', { status: 400 });
        }

        const URL = "https://app.gong.io/oauth2/generate-customer-token" +
            "?grant_type=authorization_code" +
            "&code=" + code +
            "&client_id=" + process.env.GONG_ID +
            "&redirect_uri=" + process.env.GONG_REDIRECT_URI;

        let data = process.env.GONG_ID + ":" + process.env.GONG_SECRET;
        let buff = Buffer.from(data);
        let base64data = buff.toString('base64');
        // Set the headers for the request, including the API token and content type
        const headers = {
            authorization: "Basic " + base64data,
            "content-type": "application/json",

        };

        // Send a POST request to the transcription API with the audio URL in the request body
        const response = await fetch(URL, {
            method: "POST",
            headers,
        }).then((response) => response.json())
            .then(async (data) => {
                if (data.access_token !== undefined && data.refresh_token !== undefined && data.expires_in !== undefined) {
                    const currentSeconds = (new Date().getTime() / 1000) + data.expires_in;
                    await updateDBEntry("users", { gongAccessToken: data.access_token, gongRefreshToken: data.refresh_token, gongTokenExpiration: currentSeconds }, ['email'], '==', [session.user.email], 1);
                    return data;
                }
                return null
            })
            .catch((error) => {
                console.log(error);
                return null;
            })
        if (response && Object.keys(response).length > 0) {
            res.status(200).json({ content: response, success: true });
        }
        else {
            res.status(400).json({ content: "No data found", success: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ content: error, success: false });
    }
}