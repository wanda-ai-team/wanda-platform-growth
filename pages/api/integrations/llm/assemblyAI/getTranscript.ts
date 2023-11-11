// Next.js API route support: https://nextjs.org/docs/api-routes/introduction


export const config = {
    runtime: 'edge', // this is a pre-requisite
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


    return new Response(await transcribeAudio(url, speakers, key_phrases, summary, sentiment_analysis, iab_categories), {
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

    const listOfTranscripts = await fetch("https://api.assemblyai.com/v2/transcript?limit=200&status=completed", {
        headers,
    });
    let responseData = await listOfTranscripts.json();
    let transcriptId = {} as any

    if (responseData.transcripts.length > 0) {
        for (let index = 0; index < responseData.transcripts.length; index++) {
            let tempAudioUrl = audio_url.includes("honeyfy.s3.amazonaws") ? audio_url.split("?")[0] : audio_url
            let tempAudioUrlAssemvlyAI = responseData.transcripts[index].audio_url.includes("honeyfy.s3.amazonaws") ? responseData.transcripts[index].audio_url.split("?")[0] : responseData.transcripts[index].audio_url
            if (tempAudioUrlAssemvlyAI === tempAudioUrl) {
                transcriptId = responseData.transcripts[index];
                break;
            }
        }
    }
    let responseDataT: any = {};
    if (transcriptId.id !== undefined && transcriptId.id !== '') {
        const response = await fetch(transcriptId.resource_url, {
            headers,
        });
        responseDataT = await response.json();
        transcriptId = responseData.id;
    } else {
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
        responseDataT = await response.json();
        transcriptId = responseData.id;
    }
    // Retrieve the ID of the transcript from the response data

    return JSON.stringify({
        transcript: responseDataT,
    });
}

export default handler;