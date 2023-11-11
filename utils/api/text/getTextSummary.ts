async function getTextSummary(dataF: any, url: string, output: string = "") {
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
                // const output = "summary"
                // console.log("dataF", dataF)
                // console.log("output", output)
                console.log("dataF")
                console.log("ola")
                return await fetch('/api/backend/outputContent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "content": dataF,
                        "company": "",
                        "url": "url",
                        "typeOfContent": "typeOfContent",
                        "userPrompt": dataF,
                        config: {
                            output: "summary"
                        }
                    })
                }).then((res) => res.json())
                    .then(async (data) => {
                        if (!data || !data.content || data.success === false) {
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