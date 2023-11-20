
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import axios from "axios";

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

        const url = 'https://proxy.scrapeops.io/v1/?api_key=eee6863f-84bf-4bcf-992e-5da1df8b8cf4&url=https://www.linkedin.com/company/gorattle/people/'

        axios.get(url)
            .then(function (response) {
                // print out the page response
                console.log(response);
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
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