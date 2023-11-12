async function speechToText(videoContent: any) {
    console.log("speechToText");
    return await fetch('/api/llm/whisper/speechToTextAAI',
        {
            method: 'POST',
            body: JSON.stringify({
                result: videoContent
            })
        })
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

async function speechToTextYoutubeVideo(videoContent: any) {
    console.log("speechToText");
    return await fetch('/api/llm/whisper/speechToTextTest',
        {
            method: 'POST',
            body: JSON.stringify({
                result: videoContent
            })
        })
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
    speechToText,
    speechToTextYoutubeVideo
};