import { answerQuestionBackendCall } from '@/utils/api/backend/backendCalls';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    
    const responseOpenAI = await answerQuestionBackendCall(
        "prompt"
    )
}