async function getTextSummary(data: any) {
    return await fetch('/api/llm/gpt3/textToSummary', {
        method: 'POST',
        body: JSON.stringify({
            text: data
        })
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            if (data.success === false) {
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
    getTextSummary
};