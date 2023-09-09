// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import type { NextApiRequest, NextApiResponse } from "next";
import { type } from "os";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const result = JSON.parse(req.body).result;
        let data2 = "";
        // getVideoCaptions()

        const httpbin = 'https://api.openai.com/v1/audio/transcriptions'
        const formData = new FormData()
        const formData1 = new Headers()

        // let buffer = Buffer.from(result);
        // const blob = Uint8Array.from(buffer).buffer

        const value = await getDBEntry("youtubeVideos", ["videoId"], ["=="], [result], 1)
        let audioValue: any[] = [];
        for(let i = 0; i < value.length; i++){
            audioValue.push(value[i].data.audio);
        }

        audioValue = audioValue.flat();

        await deleteDBEntry("youtubeVideos", ["videoId"], ["=="], [result], 1);
        const abc = new File(audioValue, 'abc.mp3', { type: 'audio/mp3' });

        console.log(abc)

        formData1.set('Authorization', "Bearer " + process.env.OPENAI_API_KEY);
        formData.set('model', 'whisper-1');
        formData.set('file', abc);

        const response = await fetch(httpbin, { method: 'POST', body: formData, headers: formData1 });
        const resW = await response.json();
        console.log(resW);
        data2 = (resW as { text: '' }).text;

        if(data2 === undefined || data2 === null || data2 === ""){
            return res.status(400).json({
                content: "",
                success: false,
            });
        }else{

            return res.status(200).json({
                content: data2,
                success: true,
            });
        }


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
