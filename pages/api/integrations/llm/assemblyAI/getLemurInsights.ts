// Next.js API route support: https://nextjs.org/docs/api-routes/introduction


export const config = {
    runtime: 'edge', // this is a pre-requisite
};
import { getPainPointPrompt } from '@/utils/globalPrompts';
import { AssemblyAI } from 'assemblyai'

const handler = async (req: Request): Promise<Response> => {
    let { url } = (await req.json()) as {
        url?: string;
    };


    return new Response(await transcribeAudio(url), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });


}

async function transcribeAudio(audio_url = "") {
    console.log("Transcribing audio... This might take a moment.");

    try {
        const headers = {
            authorization: process.env.ASSEMBLYAI_API_KEY as string,
            "content-type": "application/json",
        };


        // Send a POST request to the transcription API with the audio URL in the request body
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
        } else {
            console.log("Transcribing audio... This might take a moment.")
            const response = await fetch("https://api.assemblyai.com/v2/transcript", {
                method: "POST",
                body: JSON.stringify({
                    audio_url,
                    summarization: true,
                    summary_model: 'conversational',
                    summary_type: 'paragraph',
                    speaker_labels: true,
                }),
                headers,
            });
            responseDataT = await response.json();
        }

        console.log(responseDataT)

        const prompt = getPainPointPrompt()

        const response1 = await fetch("https://api.assemblyai.com/lemur/v3/generate/question-answer", {
            method: "POST",
            body: JSON.stringify({
                transcript_ids: [responseDataT.id],
                "questions": [
                    {
                        "question": prompt
                    },
                ],
                "context": "this is a client call to discuss product"
            }),
            headers,
        });

        responseData = await response1.json();

        console.log(responseData)


        return JSON.stringify({
            pain_points: responseData.response[0] !== undefined ? responseData.response[0].answer.split("\n\n") !== undefined ? responseData.response[0].answer.split("\n\n") : responseData.response[0].answer : "No answer found",
            summary: responseDataT.summary,
            speakers: responseDataT.speakers,
        });
    } catch (error) {
        console.log(error);
        return JSON.stringify({
            response: error,
        });
    }
}

export default handler;