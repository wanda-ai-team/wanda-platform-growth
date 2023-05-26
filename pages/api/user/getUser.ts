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
        const user = await getDBEntry("users", ["email"], ["=="], [session.user.email], 1);
        
        return res.status(200).json({
            content: user,
            success: true,
        });
    } catch (e: any) {
        
        return res.status(400).json({
            content: "",
            success: false,
        });
    }
}