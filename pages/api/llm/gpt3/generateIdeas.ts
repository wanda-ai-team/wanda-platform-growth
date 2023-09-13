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

    const documents = await getContext(session.user.email, platform)

    const openAIResult = await getOpenAIAnswer(documents.page_content, platform)

    res.status(200).json({ data: openAIResult })

}
