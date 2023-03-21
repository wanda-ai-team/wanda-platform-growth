// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
    Configuration,
    OpenAIApi,
} from "openai";
var fs = require('fs');
import { ytDownloader } from "@derimalec/ytdl-to-mp3";

import fetch, {
    FormData,
    fileFromSync, File, fileFrom
} from 'node-fetch'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        let videoID1 = (<string>req.query.videoID);
        const path = (<string>req.query.path);

        let data2 = "";
        // getVideoCaptions()
        videoID1 = videoID1.replace('watch?v=', '');
        videoID1 = videoID1.replace('https://www.youtube.com/watch?v=', '');

        if (data2 === undefined || data2 === null || data2 === "") {
            // let path = await downloadAudio(videoID1, './youtubeVideos/');
            const httpbin = 'https://api.openai.com/v1/audio/transcriptions'
            const formData = new FormData()
            const formData1 = new Headers()
            const mimetype = 'audio/mp3'
            const blob = fileFromSync(path, mimetype)

            formData1.set('Authorization', "Bearer " + process.env.OPENAI_API_KEY)
            formData.set('model', 'whisper-1')
            formData.set('file', blob)

            const response = await fetch(httpbin, { method: 'POST', body: formData, headers: formData1 })

            const res = await response.json();
            data2 = (res as { text: '' }).text;
        }

        return res.status(200).json({
            content: data2,
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
