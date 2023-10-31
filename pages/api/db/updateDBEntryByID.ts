import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import getDBEntry from "@/utils/api/db/getDBEntry";
import updateDBEntry from "@/utils/api/db/updateDBEntry";
import updateDBEntryByID from "@/utils/api/db/updateDBEntryByID";

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
        const { updateBody } = req.body;
        const { id } = req.body;

        if (collection === undefined || id === undefined ||  updateBody === undefined) {
            console.log("Missing query error");
            return res.status(400).json({
                content: "",
                success: false,
            });
        }
        const dbEntry = await updateDBEntryByID(collection, updateBody, id);

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