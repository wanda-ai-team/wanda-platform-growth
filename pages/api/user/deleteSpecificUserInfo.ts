import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import getDBEntry from "@/utils/api/db/getDBEntry";
import updateDBEntry from "@/utils/api/db/updateDBEntry";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        console.log("deleteSpecificUserInfo");
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

        let updateObj: any = {};
        for (let index = 0; index < info.length; index++) {
            const element = info[index];
            updateObj[element] = "";
        }

        await updateDBEntry("users", updateObj, ['email'], '==', [session.user.email], 1);

        return res.status(200).json({
            content: "success",
            success: true,
        });
    } catch (e: any) {
        console.log(e);
        return res.status(400).json({
            content: "",
            success: false,
        });
    }
}