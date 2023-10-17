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
        const projects = await getDBEntry("userProjects", ["email"], ["=="], [session.user.email], 1);

        let response = <any>[];

        if (projects.length === 0 || projects[0].data.generatedContent === undefined) {
            return res.status(400).json({
                content: [],
                success: true,
            });
        }
        const projectInfo = await getDBEntry("userGeneratedContent", ["project"], ["=="], [projects[0].id], 1);

        projectInfo.map((project: any) => {
            response.push({
                content: project.data.content,
                platform: project.data.platform,
                id: project.id,
            })
        })


        return res.status(200).json({
            projects: response,
            success: true,
        });
    } catch (e: any) {

        return res.status(400).json({
            content: [],
            success: false,
        });
    }
}