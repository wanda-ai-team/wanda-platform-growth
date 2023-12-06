import createDBEntry from "@/utils/api/db/createDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { v4 as uuidv4 } from 'uuid';

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

        const body = req.body;

        body.email = session.user.email;
        body.id = uuidv4()

        await createDBEntry("experts", body)

        return res.status(200).json({
            content: "success",
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            content: error,
            success: false,
        });

    }
}
