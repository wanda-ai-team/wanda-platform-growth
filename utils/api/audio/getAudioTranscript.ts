async function getAudioTranscript(content: any, tweet: any) {
    return await fetch('/api/llm/whisper/audioToText')
        .then((res) => res.json())
        .then((data) => {
            if (data.suceess === false) {
                return { content: "Error", success: false };
            }
            else {
                return { content: data.content, success: true };
            }
        }).catch((err) => {
            return { content: "Error", success: false };
        });
}

export {
    getAudioTranscript
};