// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getContext } from '@/utils/api/context/contextCalls';
import { getOpenAIAnswer } from '@/utils/api/openAI/openAICalls';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {

        console.log("documents")

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

        console.log(documents)

        return res.status(200).json({ documents: documents, status: 200 })
    } catch (e) {
        return res.status(500).json({ error: e, status: 500 })
    }
}