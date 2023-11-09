// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';
import { load } from 'cheerio';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import createDBEntry from '@/utils/api/db/createDBEntry';
import updateDBEntry from '@/utils/api/db/updateDBEntry';
import { authOptions } from '../auth/[...nextauth]';
import getDBEntry from '@/utils/api/db/getDBEntry';
import updateDBEntryArray from '@/utils/api/db/updateDBEntryArray';
import { getOpenAIAnswer } from '@/utils/api/openAI/openAICalls';
import { outputContentBackendCall } from '@/utils/api/backend/backendCalls';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        let { url } = req.body
        if (url.indexOf("http") === -1 && url.indexOf("https") === -1 && url.indexOf("www") === -1) {
            console.log("no url")
            url = `https://${url}`
        }

        try {
            const urlT = await new URL(url);
            await fetch(urlT)
        } catch (e) {
            console.log(e);
            res.status(400).json({ e, success: false })
            return
        }



        res.status(200).json({ success: true })
    } catch (error) {
        console.log({ error })
        res.status(400).json({ error, success: false })
    }

}
