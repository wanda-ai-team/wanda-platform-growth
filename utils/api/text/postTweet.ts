async function postTweet(content: any) {
    return await fetch('/api/twitter/postTweet', {
        method: 'POST',
        body: JSON.stringify({
            thread: content
        })
    })
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
    postTweet
};