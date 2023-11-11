// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import formidable from "formidable";
import fs from 'fs';

// export const config = {
//     api: {
//         bodyParser: false,
//         sizeLimit: '2000mb',
//     },
// };


export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb' // Set desired value here
        }
    }
}

type ProcessedFiles = Array<[string, File]>;
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        let data2 = "";
        console.log("ola")
        console.log(req.body)
        let status = 200,
            resultBody = { status: 'ok', message: 'Files were uploaded successfully' };
        let { file } = req.body;

        
        // getVideoCaptions()
        // const files = await new Promise<ProcessedFiles | undefined>((resolve, reject) => {
        //     const customOptions = { maxFileSize: 300 * 1024 * 1024 };

        //     const form = new formidable.IncomingForm(customOptions);
        //     const files: ProcessedFiles = [];
        //     console.log("ola")
        //     form.on('file', (field, file: any) => {
        //         files.push([field, file]);
        //     })
        //     form.on('end', () => resolve(files));
        //     form.on('error', (err: any) => reject(err));
        //     form.parse(req, () => {
        //         //
        //     });
        // }).catch(e => {
        //     console.log(e);
        //     console.log("ola2")
        //     status = 500;
        //     resultBody = {
        //         status: 'fail', message: 'Upload error'
        //     }
        // });

        if (file) {


            // console.log("data")
            // const data = await new Promise(function (resolve, reject) {
            //     const form = new formidable.IncomingForm({ keepExtensions: true });
            //     form.parse(req, function (err: any, fields: any, files: any) {
            //         if (err) return reject(err);
            //         resolve({ fields, files });
            //     });
            // });

            // const file = data.fields.media;
            // let url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;
            // console.log(url)

            // console.log(JSON.stringify(data.fields.media))
            // console.log(data.fields)
            let rawData = fs.readFileSync(file)

            const url = "https://api.assemblyai.com/v2/upload";

            try {
                // Send a POST request to the API to upload the file, passing in the headers and the file data
                const response = await fetch(url, {
                    method: "POST",
                    body: rawData,
                    headers: {
                        "content-Type": "application/octet-stream",
                        authorization: process.env.ASSEMBLYAI_API_KEY as string,
                    },
                });

                // If the response is successful, return the upload URL
                console.log("response")
                console.log(response)
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
            } catch (error) {
                console.error(`Error: ${error}`);
                return res.status(400).json({
                    content: "",
                    success: false,
                });
            }
        }
        return

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