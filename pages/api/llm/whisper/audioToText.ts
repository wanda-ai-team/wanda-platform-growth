// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import type { NextApiRequest, NextApiResponse } from "next";
import fetch, {
    FormData,
    File,
} from 'node-fetch'
import { type } from "os";
import Spotify from 'spotifydl-core';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        let data2 = "";
        // getVideoCaptions()

        const url = "https://open.spotify.com/episode/6KSA3AdTUc3LLUocRCHCJL?si=5vw8HIzYSqKAPP6h6MRpaQ";

        const credentials = {
            clientId: '3e9ef26e8c5b4c0397267be61de5933a',
            clientSecret: 'f7133831fdb94d9cb968d199045e7abb'
        }
        const spotify = new Spotify(credentials)

        console.log("spotify")

        const stream1 = await spotify.getID(url)
        const stream = await spotify.downloadTrack(stream1)
        let resultB: any[] = [];
        let resultA: any[] = [];
        let valueA = 0;

        await new Promise<void>((resolve, reject) => {
            stream.on('data', function (chunk: any) {
                valueA += chunk.byteLength;
                if (valueA > 1000000) {
                    resultA.push(resultB);
                    resultB = [];
                    valueA = 0;
                }
                result.push(chunk);
            }).on('finish', async () => {
                resolve();
            }).on('error', (err: any) => {
                reject(err);
            });
        });

        console.log(resultA);


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

        const abc = new File(resultA, 'abc.mp3', { type: 'audio/mp3' });

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
