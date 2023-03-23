// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fetch, {
    FormData,
    File,
} from 'node-fetch'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        console.log("typeof result");
        // const result = JSON.parse(req.body).result;
        // let data2 = "";
        // // getVideoCaptions()

        // const httpbin = 'https://api.openai.com/v1/audio/transcriptions'
        // const formData = new FormData()
        // const formData1 = new Headers()

        // // let buffer = Buffer.from(result);
        // // const blob = Uint8Array.from(buffer).buffer

        // const abc = await new File(result, 'abc.mp3', { type: 'audio/mp3' })

        // console.log("typeof result");
        // formData1.set('Authorization', "Bearer " + process.env.OPENAI_API_KEY)
        // formData.set('model', 'whisper-1')
        // formData.set('file', abc)
        // console.log(abc);

        // const response = await fetch(httpbin, { method: 'POST', body: formData, headers: formData1 })

        // const resW = await response.json();
        // data2 = (resW as { text: '' }).text;

        return res.status(200).json({
            content: "data2",
            success: true,
        });

    } catch (e: any) {
        console.log(e);
        return res.status(400).json({
            reason: e,
            success: false,
        } as {
            name: string;
            reason: string;
            success: boolean;
        });
    }
}
