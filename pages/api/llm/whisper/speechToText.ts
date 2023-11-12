// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

import { File, Blob } from "@web-std/file"
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const result = JSON.parse(req.body).result;
        let data2 = "";
        // getVideoCaptions()
        // const httpbin = 'https://api.openai.com/v1/audio/transcriptions'
        // const formData = new FormData()
        // const formData1 = new Headers()

        // // let buffer = Buffer.from(result);
        // // const blob = Uint8Array.from(buffer).buffer

        // console.log("ol1")

        console.log(result)

        const value = await getDBEntry("youtubeVideos", ["videoId"], ["=="], [result], 1)
        let audioValue: any[] = [];
        for (let i = 0; i < 1; i++) {
            audioValue.push(value[i].data.audio);
            // console.log(value[i].data.audio);   
        }

        audioValue = audioValue.flat();

        // FileSystemHandle 

        await deleteDBEntry("youtubeVideos", ["videoId"], ["=="], [result], 1);
        // console.log("ol1a")

        // // audioBlob = audioBlob.slice(0, 26214400, "audio/mp3")

        // const numberOfChunks = Math.ceil(audioValue.length / 25000000);
        // console.log(numberOfChunks)
        // let file = new File(audioValue, "audio.mp3", { type: 'audio/mp3' });
        const url = "https://api.assemblyai.com/v2/upload";



        const file = {
            buffer: audioValue,
            mimetype: 'audio/mp3',
        }

        console.log("ol1b")
        console.log(file)
          
                // Send a POST request to the API to upload the file, passing in the headers and the file data
        const response = await fetch(url, {
            method: "POST",
            body: result,
            headers: {
                authorization: process.env.ASSEMBLYAI_API_KEY as string
            },
        });

        if (response.status === 200) {
            let responseData: any = {};
            responseData = await response.json();
            if(!responseData) {
                return res.status(400).json({
                    content: "",
                    success: false,
                });
            }
            if (responseData && responseData.upload_url) {
                let transcribe: any = {};
                transcribe = await transcribeAudio(process.env.ASSEMBLYAI_API_KEY, responseData.upload_url)
                return res.status(200).json({
                    content: transcribe?.text,
                    success: true,
                });
            }
            else {
                return res.status(400).json({
                    content: "",
                    success: false,
                });
            }
        } else {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            return res.status(400).json({
                content: "",
                success: false,
            });
        }

        // for (let i = 0; i < numberOfChunks; i++) {
        //     audioValue = audioValue.slice(0, 250)
        //     // let buffN = audioValue.subarray(count * 25000000, ((value - count >= 1) ? count + 1 : (value)) * 25000000)
        //     let file = new File(audioValue, "audio.mp3", { type: 'audio/mp3' });
        //     formData1.set('Authorization', "Bearer " + process.env.OPENAI_API_KEY);
        //     formData.set('model', 'whisper-1');
        //     formData.set('file', file, "audio.mp3");
        //     console.log(file.size)
        //     const response = await fetch(httpbin, { method: 'POST', body: formData, headers: formData1 });
        //     const resW = await response.json();
        //     console.log(resW)
        //     data2 += (resW as { text: '' }).text;
        // }

        if (data2 === undefined || data2 === null || data2 === "") {
            return res.status(400).json({
                content: "",
                success: false,
            });
        } else {

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
