// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { ytDownloader } from "@derimalec/ytdl-to-mp3";

const downloadAudio = async (videoId: string, pathFile: string) => {
    // download returns the full path, with the song name + mp3 extension on it.
    console.log("downloadAudio");
    try {
        const { path } = await ytDownloader.download(
            videoId,
            pathFile,
            "lowestaudio"
        );
        console.log("downloadAudio 2");

        return path;
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

        const path = await downloadAudio(videoID1, './youtubeVideos/');

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
