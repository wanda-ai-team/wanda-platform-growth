// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
const ytdl = require('ytdl-core');
import fetch, { FormData, File } from 'node-fetch'

const downloadAudio = async (videoId: string, pathFile: string, res: any) => {
    // download returns the full path, with the song name + mp3 extension on it.
    console.log("downloadAudio");
    try {
        // const { path } = await ytDownloader.download(
        //     videoId,
        //     pathFile,
        //     "lowestaudio"
        // );

        const stream = await ytdl(videoId, { filter: 'audioonly' })
        let result: any[] = [];
        let data2;

        await new Promise<void>((resolve, reject) => {
            stream.on('data', function (chunk: any) {
                result.push(chunk);
            }).on('finish', async () => {

                const httpbin = 'https://api.openai.com/v1/audio/transcriptions'
                const formData = new FormData()
                const formData1 = new Headers()
                const mimetype = 'audio/mp3'

                // let buffer = Buffer.from(result);
                // const blob = Uint8Array.from(buffer).buffer

                const buff = Buffer.from(result); // Node.js Buffer
                const blob = new Blob([buff]); // JavaScript Blob
                const binary = new Uint8Array(result)
                const abc = await new File(result, 'abc.mp3', { type: 'audio/mp3' })

                console.log(typeof result);
                formData1.set('Authorization', "Bearer " + process.env.OPENAI_API_KEY)
                formData.set('model', 'whisper-1')
                formData.set('file', abc)
                console.log(abc);
    
                const response = await fetch(httpbin, { method: 'POST', body: formData, headers: formData1 })
    
                const res = await response.json();
                data2 = (res as { text: '' }).text;
                resolve();
            }).on('error', (err: any) => {
                reject(err);
            });
        });

        console.log(data2);
        
        console.log("");

        return data2;
    } catch (e: any) {
        console.log(e);
        return "";
    }
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const videoID1 = (<string>req.query.videoID);
        console.log("downloadAudio");
        console.log(videoID1);

        const path = await downloadAudio(videoID1, './youtubeVideos/', res);
        console.log("downloadAudio 3");
        if (path === undefined || path === null || path === "") {
            return res.status(400).json({
                success: false,
            });
        } else {
            return res.status(200).json({
                content: path,
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
