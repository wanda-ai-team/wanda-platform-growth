async function getTextSummary(dataF: any, url: string) {
    console.log(dataF);
    return await fetch('/api/llm/gpt3/textToSummary', {
        method: 'POST',
        body: JSON.stringify({
            text: dataF,
            url: url,
            newF: true
        })
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (data.success === false) {
                return await fetch('https://langchain-py.vercel.app/', {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        docsT: dataF,
                        url: url
                    })
                })
                    .then((res) => res.json())
                    .then(async (data) => {
                        if (!data) {
                            return { content: "Error", success: false };
                        }
                        else {
                            await fetch('/api/llm/gpt3/textToSummary', {
                                method: 'POST',
                                body: JSON.stringify({
                                    text: data.response.trim(),
                                    url: url,
                                    newF: false
                                })
                            })
                            return { content: data.response.trim(), success: true };
                        }
                    }).catch((err) => {
                        return { content: "Error", success: false };
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