async function convertTextToThread(content: string, output: string) {
    return await fetch('/api/llm/gpt3/textToThread?text=' + content + '&output=' + output)
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
    convertTextToThread
};