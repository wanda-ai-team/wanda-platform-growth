import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import getDBEntry from "@/utils/api/db/getDBEntry";
import getDBEntryById from "@/utils/api/db/getDBEntryById";

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

        const { collection } = req.body;
        const { id } = req.body;

        if (collection === undefined || id === undefined) {
            console.log("Missing query error");
            return res.status(400).json({
                content: "",
                success: false,
            });
        }


        const dbEntry = await getDBEntryById(collection, id);
        // const dbEntry = await getDBEntry(collection as string, condition as any[], conditionOperation as any[], conditionValue as any[], parseInt(numberOfConditions as string));
        return res.status(200).json({
            content: dbEntry,
            success: true,
        });
    } catch (e: any) {

        return res.status(400).json({
            content: "",
            success: false,
        });
    }
}