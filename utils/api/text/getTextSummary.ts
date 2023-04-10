async function getTextSummary(data: any, url: string) {
    return await fetch('https://langchain-py.vercel.app/', {
        method: 'POST',
        body: JSON.stringify({
            docsT: data,
            url: url
        })
    })
        .then((res) => res.json())
        .then((data) => {
            return { content: data, success: true };
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