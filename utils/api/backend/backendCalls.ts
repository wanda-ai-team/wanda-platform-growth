async function embedText(contet: string, type: string) {
    await fetch('/api/backend/embedText',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "content": contet,
                "type": type
            })
        })
}

async function vectorDBQuery(contet: string, type: string) {
    await fetch('/api/backend/vectorDBQuery',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "content": contet,
                "type": type
            })
        })
}

export {
    embedText,
    vectorDBQuery
};