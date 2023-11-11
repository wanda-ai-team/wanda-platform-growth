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

async function outputContent(userPrompt: string, output: string) {
    await fetch('/api/backend/outputContent',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "userPrompt": userPrompt,
                "config": {
                    "output": output
                }
            })
        })
}

async function outputContentBackendCall(userPrompt: string, output: string, gongCallId: string){
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
    );

    return response.data
}

export {
    embedText,
    vectorDBQuery,
    outputContent,
    outputContentBackendCall
};