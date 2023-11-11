import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import getDBEntry from "@/utils/api/db/getDBEntry";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const session = await getServerSession(req, res, authOptions);

        if (
            session === null ||
            session === undefined ||
            session.user === null ||
            session.user === undefined
        ) {
            console.log("Missing session error");
            res.status(400).end();
            return;
        }

        const { info } = req.body

        const user = await getDBEntry("users", ["email"], ["=="], [session.user.email], 1);
        const response = []
        const infoO = <any>{}
        for (let index = 0; index < info.length; index++) {
            if (user[0].data[info[index]] !== undefined) {
                infoO[info[index]] = user[0].data[info[index]].slice(0, 10).concat("......")

            }
        }
        response.push(
            infoO
        )
        if (response === undefined || response.length === 0) {
            return res.status(400).json({
                content: "",
                success: false,
            });

        }
        return res.status(200).json({
            content: response,
            success: true,
        });
    } catch (e: any) {
        console.log(e)
        return res.status(400).json({
            content: "",
            success: false,
        });
    }
}