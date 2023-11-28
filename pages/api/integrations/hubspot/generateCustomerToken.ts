// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import updateDBEntry from "@/utils/api/db/updateDBEntry";
import axios from "axios";
import { request } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { Client } from "@hubspot/api-client";
const GRANT_TYPES = {
    AUTHORIZATION_CODE: 'authorization_code',
    REFRESH_TOKEN: 'refresh_token',
};
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


        const hubspotClient = new Client();
        const response = await hubspotClient.oauth.tokensApi.create(
            GRANT_TYPES.AUTHORIZATION_CODE,
            code,
            process.env.HUBSPOT_REDIRECT_URI,
            process.env.HUBSPOT_CLIENT_ID,
            process.env.HUBSPOT_CLIENT_SECRET
        ).then(async (data) => {
            if (data.accessToken !== undefined && data.refreshToken !== undefined && data.expiresIn !== undefined) {
                const currentSeconds = (new Date().getTime() / 1000) + data.expiresIn;
                await updateDBEntry("users", { hubspotAccessToken: data.accessToken, hubspotRefreshToken: data.refreshToken, hubspotTokenExpiration: currentSeconds }, ['email'], '==', [session.user.email], 1);
                return data;
            }
            return null
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