import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
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

        const URL = "https://api.crunchbase.com/api/v4/searches/organizations?user_key=" + process.env.CRUNCHBASE_API_KEY;

        // Send a POST request to the transcription API with the audio URL in the request body
        const response = await fetch(URL, {
            method: "POST",
            body: JSON.stringify(
                {
                    "field_ids": [
                        "identifier",
                        "location_identifiers",
                        "short_description",
                        "rank_org"
                    ],
                    "order": [
                        {
                            "field_id": "rank_org",
                            "sort": "asc"
                        }
                    ],
                    "query": [
                    ],
                    "limit": 50
                }),
        }).then((response) => response.json())
            .then((data) => {
                data.entities.forEach((entity: any) => {
                    console.log(entity);
                })
            })
    } catch (e) {
        return res.status(500).json({
            error: {
                code: "server-error",
                message: "Something went wrong.",
            },
        });
    }
}