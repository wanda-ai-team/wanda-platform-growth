// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import createDBEntry from "@/utils/api/db/createDBEntry";
import type { NextApiRequest, NextApiResponse } from "next";
import ytdl from "ytdl-core";
import "fs"

const downloadAudio = async (videoId: string, pathFile: string, res: any) => {
    try {
        const stream = await ytdl(videoId, { filter: 'audio' })
        let result: any[] = [];
        let resultA: any[] = [];
        let value = 0;

        await new Promise<void>((resolve, reject) => {
            stream.on('data', function (chunk: any) {
                value += chunk.byteLength;
                if (value > 1000000) {
                    resultA.push(result);
                    result = [];
                    value = 0;
                }
                result.push(chunk);
            }).on('finish', async () => {
                resolve();
            }).on('error', (err: any) => {
                reject(err);
            });
        });
        for (let i = 0; i < resultA.length; i++) {
            await createDBEntry("youtubeVideos", { videoId: videoId, audio: resultA[i] });
        }


        const audioFile = new Blob(result, { type: 'audio/mp3' });


        return { result: result, videoId: videoId };
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

        // const result = await downloadAudio(videoID1, './youtubeVideos/', res);
        const result = { videoId: videoID1 }
        if (result === undefined || result === null) {
            return res.status(400).json({
                success: false,
            });
        } else {
            return res.status(200).json({
                content: result,
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
