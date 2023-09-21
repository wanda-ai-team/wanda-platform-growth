async function getTextSummary(dataF: any, url: string) {
    return await fetch('/api/llm/gpt3/textToSummary', {
        method: 'POST',
        body: JSON.stringify({
            text: dataF,
            url: url,
            newF: true
        })
    }).then((res) => res.json())
        .then(async (data) => {
            if (data.success === false) {
                return await fetch('/api/backend/summarizeText',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "content": dataF,
                            "company": "",
                            "url": "url",
                            "typeOfContent": "typeOfContent"
                        })
                    }).then((res) => res.json())
                    .then(async (data) => {
                        console.log(data)
                        if (!data || !data.content) {
                            return { content: "Error", success: false };
                        }
                        else {
                            await fetch('/api/llm/gpt3/textToSummary', {
                                method: 'POST',
                                body: JSON.stringify({
                                    text: data.content,
                                    url: url,
                                    newF: false
                                })
                            })
                            console.log("data")
                            console.log(data.content)
                            return { content: data.content, success: true };
                        }
                    }).catch((err) => {
                        console.log(err)
                        return { content: "Error", success: false }
                    });

            }
            else {
                return { content: data.content, success: true };
            }
        }).catch((err) => {
            return { content: "Error", success: false };
        });
}

export {
    getTextSummary
};