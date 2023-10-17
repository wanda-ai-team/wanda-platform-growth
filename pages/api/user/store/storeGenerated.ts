import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import getDBEntry from "@/utils/api/db/getDBEntry";
import createDBEntry from "@/utils/api/db/createDBEntry";
import updateDBEntryArray from "@/utils/api/db/updateDBEntryArray";
import updateDBEntry from "@/utils/api/db/updateDBEntry";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {       
        const session = await getServerSession(req, res, authOptions);

        const { platform, content } = req.body
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

        let context = await getDBEntry("userProjects", ['email'], ['=='], [session.user.email], 1)
        if (context.length <= 0) {
          context = await createDBEntry("userProjects", { email: session.user.email });
          await updateDBEntry("users", { projects: [context.id] }, ['email'], '==', [session.user.email], 1);
        }
        else {
          context = context[0]
        }
      
        const generatedContent = await createDBEntry("userGeneratedContent", { platform: platform, project: context.id, content: content });
        await updateDBEntryArray("userProjects", generatedContent.id, 'generatedContent', ['email'], '==', [session.user.email], 1);
        
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