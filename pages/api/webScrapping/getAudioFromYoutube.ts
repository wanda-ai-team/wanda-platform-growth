// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
const ytdl = require('ytdl-core');

const downloadAudio = async (videoId: string, pathFile: string, res: any) => {
    console.log("downloadAudio");
    try {

        const stream = await ytdl(videoId, { filter: 'audioonly' })
        let result: any[] = [];

        await new Promise<void>((resolve, reject) => {
            stream.on('data', function (chunk: any) {
                result.push(chunk);
            }).on('finish', async () => {
                resolve();
            }).on('error', (err: any) => {
                reject(err);
            });
        });

        return result;
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

        const path = await downloadAudio(videoID1, './youtubeVideos/', res);
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
