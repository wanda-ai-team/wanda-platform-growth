async function getTextSummary(data: any, url: string) {
    return await fetch('https://langchain-py.vercel.app/', {
        // return await fetch('/api/llm/gpt3/textToSummary', {
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        body: JSON.stringify({
            docsT: data,
            url: url
        })
    })
        .then((res) => res.json())
        .then((data) => {
            if (!data) {
                return { content: "Error", success: false };
            }
            else {
                return { content: data.response, success: true };
            }
            // if (data.success === false) {
            //     return { content: "Error", success: false };
            // }
            // else {
            //     return { content: data.content, success: true };
            // }
        }).catch((err) => {
            return { content: "Error", success: false };
        });
}

export {
    getTextSummary
};