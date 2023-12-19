import { assistantQuestionTest } from '@/utils/api/integrations/slack/bot';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    
    const { message } = req.body;
    const response = await assistantQuestionTest(message);
    res.status(200).json({ response });
}