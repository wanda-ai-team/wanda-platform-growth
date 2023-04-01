async function changeTwitterThread(content: any, tweet: any) {
    return await fetch('/api/llm/gpt3/threadChange?text=' + content + "&tweet=" + tweet)
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
    changeTwitterThread
};