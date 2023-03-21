// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getSubtitles } from 'youtube-captions-scraper';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let videoID1 = (<string>req.query.videoID);
    videoID1 = videoID1.replace('https://www.youtube.com/watch?v=', '');
    videoID1 = videoID1.replace('watch?v=', '');
    try {
        const data2 = await getSubtitles({
            videoID: videoID1, // youtube video id
            lang: 'en' // default: `en`
        }).then((captions: any) => {
            console.log(captions);
            captions = captions.map((caption: any) => caption.text);
            captions = captions.join('');
            captions = captions.replace(/(\r\n|\n|\r)/gm, "");
            return captions;
        });
        return res.status(200).json({
            subtitles: data2,
            success: true,
        });
    } catch (e: any) {
        console.log(e);
        return res.status(400).json({
            subtitles: "",
            success: false,
        });
    }
}
