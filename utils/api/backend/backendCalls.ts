import axios from "axios";
import { Blocks, Elements, Message } from "slack-block-builder";

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

async function transcribeSlackVideoFile(slackChannelS: string, audioUrlS: string, eventTs: string) {
    try {
        const response = await axios.post(process.env.BACKEND_URL + '/llmTools/transcription/transcribe', {
            config: {
                slackChannel: slackChannelS,
                audioUrl: audioUrlS,
                slackThreadTs: eventTs
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
        console.log("response")
        console.log(response)
        return response === null ? response : response
    } catch (error) {
        console.log("error")
        console.log(error)
        return null
    }
}



async function assistantQuestionBackend(slackChannelS: any, messageTs: any, query: any, web: any) {
    try {
        const response = await axios.post(process.env.BACKEND_URL + '/llmTools/assistant/createWithGoogle', {
            userPrompt: query,
            config: {
                slackChannel: slackChannelS,
                slackThreadTs: messageTs
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
        if (response === null) {
            await web.chat.postMessage({
                channel: slackChannelS,
                thread_ts: messageTs,
                text: "Error while answering the question, please try again later.",
            });
        } else {
            if (response && response.data && response.data) {
                const messageF = Message({ channel: slackChannelS, text: "Answering questiom", threadTs: messageTs })
                    .blocks(
                        Blocks.Section({ text: response.data }),
                        Blocks.Actions()
                            .elements(
                                Elements.Button({ text: 'Great!', actionId: 'tommyActionGreat' }).primary(),
                                Elements.Button({ text: 'Tell me more ...', actionId: 'tommyActionTellMeMore' }),
                                Elements.Button({ text: 'Ask the real Tommy', actionId: 'tommyActionAskRealTommy' }).danger()
                            ))
                    .asUser()
                    .buildToJSON();

                await web.chat.postMessage(messageF);
            }
        }
        return response === null ? response : response
    } catch (error) {
        console.log("error")
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
    transcribeSlackVideoFile,
    assistantQuestionBackend
};