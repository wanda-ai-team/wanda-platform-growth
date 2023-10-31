// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export const config = {
    runtime: 'edge', // this is a pre-requisite
};

const handler = async (req: Request): Promise<Response> => {
    let { transcriptId = "" } = (await req.json()) as {
        transcriptId?: string;
    };
    return new Response(await transcribeAudio(transcriptId), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });


}

async function transcribeAudio(transcriptId: string) {

    const headers = {
        authorization: process.env.ASSEMBLYAI_API_KEY as string,
        "content-type": "application/json",
    };

    // Construct the polling endpoint URL using the transcript ID
    const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;
    // Poll the transcription API until the transcript is ready
    let result: any = {};
    while (true) {
        const pollingResponse = await fetch(pollingEndpoint, {
            headers: headers
        })
        const transcriptionResult = await pollingResponse.json()

        if (transcriptionResult.status === 'completed') {
            // print the results
            result = transcriptionResult
            result.processing = false;
            break
        } else if (transcriptionResult.status === 'error') {
            result.processing = false;
            throw new Error(`Transcription failed: ${transcriptionResult.error}`)
        } else {
            console.log('Waiting for transcription to complete...')
            result.processing = true;
            break
        }
    }
    if (result.processing) {
        return JSON.stringify({ processing: true })
    } else {
        return JSON.stringify({
            auto_highlights_result: result.auto_highlights_result,
            transcript: result.text,
            summary: result.summary,
            sentiment_analysis: result.sentiment_analysis_results,
            speakers: result.utterances,
            topics: result.iab_categories_result.summary
        });
    }
}

export default handler;