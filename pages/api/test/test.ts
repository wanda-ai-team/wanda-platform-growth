import { answerQuestionBackendCall } from '@/utils/api/backend/backendCalls';
import { sendEmailTest } from '@/utils/api/integrations/slack/bot';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    
    const { message } = req.body;
    sendEmailTest(message)
}