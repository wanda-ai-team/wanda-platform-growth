// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ButtonGroup } from "@chakra-ui/react";
import type { NextApiRequest, NextApiResponse } from "next";
const getPodcastFromFeed = require("podparse")
var xml2js = require('xml2js');
var https = require('https');
const itunesAPI = require("node-itunes-search");
var request = require('request');


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // try {
    //     let data2 = "";

    //     var parser = new xml2js.Parser();

    //     parser.on('error', function (err: any) { console.log('Parser error', err); });

    //     var data = '';

    //     var datatest: any[] = []
    //     var rssUrl = "";

    //     const searchOptions = new itunesAPI.ItunesSearchOptions({
    //         term: "https://podcasts.apple.com/us/podcast/race-chaser-with-alaska-willam/id1408740329", // All searches require a single string query.

    //         limit: 1 // An optional maximum number of returned results may be specified.
    //     });

    //     itunesAPI.searchItunes(searchOptions).then((result: any) => {
    //         rssUrl = result.results[0].raw.feedUrl;
    //     });

    //     console.log("ola")

    //     await new Promise((resolve) => {
    //         https.get("https://sellersessions.libsyn.com/rss", async function (res: { statusCode: number; on: (arg0: string, arg1: { (data_: any): void; (): void; }) => void; }) {
    //             if (res.statusCode >= 200 && res.statusCode < 400) {
    //                 res.on('data', (data_) => { data += data_.toString(); }
    //                 );
    //                 res.on('end', function () {
    //                     parser.parseString(data, async function (err: any, result: any) {
    //                         data = result.rss.channel[0].item[0].enclosure[0]['$'].url;
    //                         console.log(data)
    //                         const stream = request.get(data)

    //                         let audioValue: any[] = []
    //                         const formData = new FormData()
    //                         const formData1 = new Headers()
    //                         const httpbin = 'https://api.openai.com/v1/audio/transcriptions'

    //                         await new Promise<void>((resolve, reject) => {
    //                             stream.on('data', function (chunk: any) {
    //                                 audioValue.push(chunk)
    //                             }).on('end', async () => {
    //                                 console.log("data")
    //                                 resolve();
    //                             }).on('error', (err: any) => {
    //                                 console.log(err)
    //                                 reject(err);
    //                             });
    //                         });

    //                         console.log("data1")

    //                         audioValue = audioValue.flat();
    //                         audioValue = audioValue.splice(0, 1000);
    //                         console.log(audioValue)

    //                         const abc = new File(audioValue, 'abc.mp3', { type: 'audio/mp3' });

    //                         formData1.set('Authorization', "Bearer " + process.env.OPENAI_API_KEY);
    //                         formData.set('model', 'whisper-1');
    //                         formData.set('file', abc);

    //                         const response = await fetch(httpbin, { method: 'POST', body: formData, headers: formData1 });
    //                         const resW = await response.json();
    //                         console.log(resW);
    //                         data2 = (resW as { text: '' }).text;
    //                         console.log(data2);
    //                         resolve("");
    //                     });
    //                 });
    //             }
    //         });
    //     })




    //     // const podcast = getPodcastFromFeed("https://sellersessions.libsyn.com/rss.xml")

    //     console.log("data")
    //     // "My Podcast"

    //     return res.status(200).json({
    //         content: data2,
    //         success: true,
    //     });
    // }


    // catch (e: any) {
    //     console.log(e);
    //     return res.status(400).json({
    //         reason: e,
    //         success: false,
    //     } as {
    //         name: string;
    //         reason: string;
    //         success: boolean;
    //     });
    // }
}
