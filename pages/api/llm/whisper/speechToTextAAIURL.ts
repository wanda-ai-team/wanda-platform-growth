// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
    runtime: "edge",
};



const handler = async (req: Request): Promise<Response> => {
    let { url } = (await req.json()) as {
        url?: string;
    };


    let transcribe: any = {};
    console.log("ola, tudo bem?");
    transcribe = await transcribeAudio(process.env.ASSEMBLYAI_API_KEY, url)
    console.log(transcribe)
    return new Response(transcribe, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });


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
        body: JSON.stringify({
            audio_url,
            speaker_labels: true
        }),
        headers,
    });

    console.log(audio_url)

    // Retrieve the ID of the transcript from the response data
    let responseData: any = {};
    responseData = await response.json();
    const transcriptId = responseData.id;

    // Construct the polling endpoint URL using the transcript ID
    const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;
    const encoder = new TextEncoder();
    // Poll the transcription API until the transcript is ready
    return new ReadableStream({
        async start(controller) {
            while (true) {
                // Send a GET request to the polling endpoint to retrieve the status of the transcript
                const pollingResponse = await fetch(pollingEndpoint, { headers });
                let transcriptionResult: any = {};
                transcriptionResult = await pollingResponse.json();
                const text = transcriptionResult;
                if (transcriptionResult.status === "processing") {
                    controller.enqueue(encoder.encode("processing"));
                }
                // If the transcription is complete, return the transcript object
                if (transcriptionResult.status === "completed") {
                    controller.enqueue(encoder.encode(transcriptionResult.text));
                    controller.close();
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
        },
    });
}

export default handler;