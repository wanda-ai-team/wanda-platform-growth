// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import YoutubeMp3Downloader from "youtube-mp3-downloader";
import ffmpeg from "ffmpeg-static";
import { File, Blob } from "@web-std/file"
import ytdl from "ytdl-core";
import path from "path";
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const result = JSON.parse(req.body).result;
        let data2 = "";
        let videoFileName = result.split("v=")[1] + ".mp3"
        const output = path.resolve("./tmp/", videoFileName);

        const video = ytdl(result, { filter: 'audioonly' });


        await video.pipe(fs.createWriteStream(output));
        await video.on('progress', (chunkLength, downloaded, total) => {
            const percent = downloaded / total;
            console.log((percent * 100).toFixed(2) + '%');
        });
        await video.on('end', async () => {
            const url = "https://api.assemblyai.com/v2/upload";
            let urlVideo = ""
            console.log("Downloaded")
            await fs.readFile(output, async (err, data) => {

                await fetch(url, {
                    headers: {
                        authorization: process.env.ASSEMBLYAI_API_KEY as string
                    },
                    body: data,
                    method: 'POST'
                })
                    .then(response => response.json())
                    .then(async data => {
                        urlVideo = data['upload_url']
                        console.log(`URL: ${data['upload_url']}`)

                        const transcribe = await transcribeAudio(process.env.ASSEMBLYAI_API_KEY, urlVideo)
                        fs.unlinkSync(output);
                        return res.status(200).json({
                            content: transcribe?.text,
                            success: true,
                        });
                    })
                    .catch((error) => {
                        console.error(`Error: ${error}`);
                    })
            })
        });
        // return

        // const ffmpegPath = ffmpeg === null ? "" : ffmpeg;
        // const YD = new YoutubeMp3Downloader({
        //     ffmpegPath: ffmpegPath,
        //     outputPath: '/tmp/',
        //     youtubeVideoQuality: 'lowest',
        //     queueParallelism: 2,
        //     progressTimeout: 2000
        // })

        // YD.download(result.split("v=")[1])

        // YD.on('progress', (data) => {
        //     console.log(data.progress.percentage + '% downloaded')
        // })

        // YD.on('finished', async (err, video) => {
        //     const videoFileName = video.file
        //     console.log(`Downloaded ${videoFileName}`)

        //     // Continue on to get transcript here
        //     console.log(videoFileName)
        //     const url = "https://api.assemblyai.com/v2/upload";
        //     let urlVideo = ""
        //     await fs.readFile(videoFileName, async (err, data) => {
        //         if (err) {
        //             return console.log(err);
        //         }

        //         // add the code below to the arrow function

        //         await fetch(url, {
        //             headers: {
        //                 authorization: process.env.ASSEMBLYAI_API_KEY as string
        //             },
        //             body: data,
        //             method: 'POST'
        //         })
        //             .then(response => response.json())
        //             .then(async data => {
        //                 urlVideo = data['upload_url']
        //                 console.log(`URL: ${data['upload_url']}`)

        //                 const transcribe = await transcribeAudio(process.env.ASSEMBLYAI_API_KEY, urlVideo)
        //                 return res.status(200).json({
        //                     content: transcribe?.text,
        //                     success: true,
        //                 });
        //             })
        //             .catch((error) => {
        //                 console.error(`Error: ${error}`);
        //             })

        //     })
        // })

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

async function transcribeAudio(api_token: any, audio_url: any) {
    console.log("Transcribing audio... This might take a moment.");

    // Set the headers for the request, including the API token and content type
    const headers = {
        authorization: process.env.ASSEMBLYAI_API_KEY as string,
        "content-type": "application/json",
    };

    // Send a POST request to the transcription API with the audio URL in the request body
    const response = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        body: JSON.stringify({ audio_url }),
        headers,
    });

    // Retrieve the ID of the transcript from the response data
    let responseData: any = {};
    responseData = await response.json();
    const transcriptId = responseData.id;

    // Construct the polling endpoint URL using the transcript ID
    const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;

    // Poll the transcription API until the transcript is ready
    while (true) {
        // Send a GET request to the polling endpoint to retrieve the status of the transcript
        const pollingResponse = await fetch(pollingEndpoint, { headers });
        let transcriptionResult: any = {};
        transcriptionResult = await pollingResponse.json();
        console.log(transcriptionResult)
        // If the transcription is complete, return the transcript object
        if (transcriptionResult.status === "completed") {
            return transcriptionResult;
        }
        // If the transcription has failed, throw an error with the error message
        else if (transcriptionResult.status === "error") {
            throw new Error(`Transcription failed: ${transcriptionResult.error}`);
        }
        // If the transcription is still in progress, wait for a few seconds before polling again
        else {
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
}
