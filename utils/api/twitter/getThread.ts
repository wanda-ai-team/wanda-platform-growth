async function getThread(id: any) {
    return await fetch('/api/twitter/getThread', {
        method: 'POST',
        body: JSON.stringify({
            id: id
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
    getThread
};