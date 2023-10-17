// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import updateDBEntry from "@/utils/api/db/updateDBEntry";
import { generateCustomerToken, retrieveCallsByDate } from "@/utils/common/integrations/integrationsURLs";
import axios from "axios";
import { Console } from "console";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
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

    const response = await refreshToken(session.user.email);

    if (Object.keys(response).length > 0) {
        res.status(200).json({ content: response, success: true });
    }
    else {
        res.status(400).json({ content: "No data found", success: false });
    }
}