import axios from "axios";

async function embedText(contet: string, company: string, url: string, typeOfContent: string) {
    await fetch('/api/backend/embedText',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "content": contet,
                "company": company,
                "url": url,
                "typeOfContent": typeOfContent
            })
        })
}

async function vectorDBQuery(contet: string) {
    await fetch('/api/backend/vectorDBQuery',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "content": contet
            })
        })
}

async function outputContent(userPrompt: string, output: string, toneStyle: string, writingStyle: string) {
    return await fetch('/api/backend/outputContent',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "userPrompt": userPrompt,
                "config": {
                    "output": output,
                    "toneStyle": toneStyle,
                    "writingStyle": writingStyle,
                }
            })
        })
}

async function outputContentBackendCall(userPrompt: string, output: string, gongCallId: string) {
    const response = await axios.post(process.env.BACKEND_URL + '/llmTools/outputContent', {
        userPrompt: userPrompt,
        systemPrompt: "",
        config: {
            "output": output,
            "gongCallId": gongCallId
        }
    },
        {
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${123}`
            }
        }
    ).catch((error) => {
        console.log(error)
        return null
    });

    return response === null ? response : response.data
}



async function answerQuestionBackendCall(userPrompt: string) {
    try {
        const response = await axios.post(process.env.BACKEND_URL + '/llmTools/answerQuestionTool', {
            userPrompt: userPrompt
        },
            {
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${123}`
                }
            }
        ).catch((error) => {
            console.log(error)
            return null
        });
        console.log("response")
        console.log(response)
        return response === null ? response : response.data

    } catch (error) {
        console.log(error)
        return null
    }
}

async function transcribeSlackVideoFile(slackChannelS: string, audioUrlS: string) {
    try {

        console.log("transcribeSlackVideoFile")
        console.log(process.env.BACKEND_URL + '/llmTools/transcription/transcribe')
        await axios.post(process.env.BACKEND_URL + '/llmTools/transcription/transcribe', {
            config: {
                slackChannel: slackChannelS,
                audioUrl: audioUrlS
            }
        },
            {
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${123}`
                }
            }
        ).catch((error) => {
            console.log(error)
        });
    } catch (error) {
        console.log(error)
        return null
    }
}

export {
    embedText,
    vectorDBQuery,
    outputContent,
    outputContentBackendCall,
    answerQuestionBackendCall,
    transcribeSlackVideoFile
};