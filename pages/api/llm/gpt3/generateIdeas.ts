// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '../../auth/[...nextauth]';
import { getContext } from '@/utils/api/context/contextCalls';
import { getOpenAIAnswer } from '@/utils/api/openAI/openAICalls';



export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log("documents")
    try {

        const session = await getServerSession(req, res, authOptions)
        // Error handling

        if (!session?.user || !session?.user?.email) {
            return res.status(401).json({
                error: {
                    code: "no-access",
                    message: "You are not signed in.",
                },
            });
        }

        const { platform } = req.body

        console.log(platform)
        let documents = null
        try {
            documents = await getContext(session.user.email, platform)
        } catch (e) {
            console.log(e)
        }

        let documentsString = ""

        if (documents && documents.length > 0 && documents[0].page_content) {
            documents.forEach((document: { page_content: string; }) => {
                documentsString += document.page_content
            }
            )
        }

        console.log(documentsString)

        const openAIResult = await getOpenAIAnswer(documentsString, platform)

        res.status(200).json({ data: openAIResult, status: 200 })
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: e, status: 500 })
    }

}
