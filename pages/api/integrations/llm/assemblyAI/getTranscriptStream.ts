// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
    runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
    let { url, speakers = false, key_phrases = false, summary = false, sentiment_analysis = false, iab_categories = false } = (await req.json()) as {
        url?: string;
        speakers?: boolean;
        key_phrases?: boolean;
        summary?: boolean;
        sentiment_analysis?: boolean;
        iab_categories?: boolean;
    };


    let transcribe: any = {};
    transcribe = await transcribeAudio(url, speakers, key_phrases, summary, sentiment_analysis, iab_categories)
    return new Response(transcribe, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });


}

async function transcribeAudio(audio_url = "", speakers: boolean, key_phrases: boolean, summary: boolean, sentiment_analysis: boolean, iab_categories: boolean) {
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
            sentiment_analysis: sentiment_analysis,
            speaker_labels: speakers,
            auto_highlights: key_phrases,
            iab_categories: iab_categories,
            summarization: summary,
            summary_model: 'conversational',
            summary_type: 'paragraph',
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
    let result;
    const readableStream = new ReadableStream({
        async start(controller) {
            while (true) {
                // The start method is where you'll add the stream's content
                // Queue the encoded content into the stream
                // Prevent more content from being
                // added to the stream

                const pollingResponse = await fetch(pollingEndpoint, {
                    headers: headers
                })
                const transcriptionResult = await pollingResponse.json()
                
                controller.enqueue(encoder.encode(transcriptionResult));
                console.log(transcriptionResult)

                if (transcriptionResult.status === 'completed') {
                    // print the results
                    result = transcriptionResult
                    break
                } else if (transcriptionResult.status === 'error') {
                    throw new Error(`Transcription failed: ${transcriptionResult.error}`)
                } else {
                    await new Promise((resolve) => setTimeout(resolve, 3000))
                }
            }
            
            controller.close();

        },

    });
    // TextDecoders can decode streams of
    // encoded content. You'll use this to
    // transform the streamed content before
    // it's read by the client
    const decoder = new TextDecoder();
    // TransformStreams can transform a stream's chunks
    // before they're read in the client
    const transformStream = new TransformStream({
        transform(chunk, controller) {
            // Decode the content, so it can be transformed
            const text = decoder.decode(chunk);
            // Make the text uppercase, then encode it and
            // add it back to the stream
            controller.enqueue(encoder.encode(text.toUpperCase()));
        },
    });

    // Finally, send the streamed response. Result:
    // "STREAM ME!" will be displayed in the client
    return new Response(readableStream.pipeThrough(transformStream), {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
    });
}

export default handler;