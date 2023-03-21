async function speechToText(youtubeURL: any, path: any) {
    return await fetch('/api/llm/whisper/speechToText?videoID=' + youtubeURL + '&path=' + path)
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
    speechToText
};