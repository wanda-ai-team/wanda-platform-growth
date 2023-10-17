// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { put } from '@vercel/blob';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let { url } = req.body;

    const { searchParams } = new URL(url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return null;
    }
    const blob = await put(filename, req.body, {
        access: 'public',
    });

    return res.json(blob);

}
