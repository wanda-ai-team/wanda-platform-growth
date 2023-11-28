import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import PDLJS from 'peopledatalabs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const session = await getServerSession(req, res, authOptions)
        if (!session?.user || !session?.user?.email) {
            return res.status(401).json({
                error: {
                    code: "no-access",
                    message: "You are not signed in.",
                },
            });
        }

        const { linkedin } = req.body

        const url = 'https://linkedin-company-data.p.rapidapi.com/linkedInCompanyDataJsonV3Beta';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': '7629f42cf5msh5aeeaa4f759cc33p11e6f8jsn45dc06a0b558',
                'X-RapidAPI-Host': 'linkedin-company-data.p.rapidapi.com'
            },
            body: JSON.stringify({
                liUrl: linkedin
            })
        });
        const result = await response.text();
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: {
                code: "server-error",
                message: "Something went wrong.",
            },
        });
    }
}