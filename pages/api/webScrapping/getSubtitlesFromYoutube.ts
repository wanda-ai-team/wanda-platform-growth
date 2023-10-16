// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
var getSubtitles = require('youtube-captions-scraper').getSubtitles;
import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let videoID1 = (<string>req.query.videoID);
    if (videoID1.includes("watch")) {
        videoID1 = videoID1.replace('https://www.youtube.com/watch?v=', '');
        videoID1 = videoID1.replace('watch?v=', '');
    } else {
        if (videoID1.includes("shorts")) {
            videoID1 = videoID1.replace('https://www.youtube.com/shorts/', '');
        }
    }
    try {
        let subtitlesWithPrompt = await YoutubeTranscript.fetchTranscript(videoID1);
        subtitlesWithPrompt.forEach((element: any) => { element.offser = element.offset / 1000; });
        const newArr = subtitlesWithPrompt.map(({ duration, offset, ...rest }) => {
            return rest;
        });



        // const data2 = await getSubtitles({
        //     videoID: videoID1, // youtube video id
        //     lang: 'en' // default: `en`
        // }).then((captions: any) => {
        //     captions = captions.map((caption: any) => caption.text);
        //     captions = captions.join('');
        //     captions = captions.replace(/(\r\n|\n|\r)/gm, "");
        //     return captions;
        // });

        return res.status(200).json({
            subtitles: newArr,
            success: true,
        });
    } catch (e: any) {
        return res.status(400).json({
            subtitles: "",
            success: false,
        });
    }
}
