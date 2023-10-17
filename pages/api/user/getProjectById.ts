import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
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


        const { projectId } = req.body
        const context = await getDBEntryById("userGeneratedContent", projectId);

        if (context !== null && context !== undefined) {
            const project = context;
            return res.status(200).json({
                project: project,
                success: true,
            });

        } else {

            return res.status(400).json({
                content: "",
                success: false,
            });
        }

    } catch (e: any) {

        return res.status(400).json({
            content: "",
            success: false,
        });
    }
}