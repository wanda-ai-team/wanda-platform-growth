async function embedText(contet: string, company: string, url: string, typeOfContent: string) {
    await fetch('/api/backend/embedText',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "content": contet,
                "company": company,
                "url": url,
                "typeOfContent": typeOfContent
            })
        })
}

async function vectorDBQuery(contet: string) {
    await fetch('/api/backend/vectorDBQuery',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "content": contet
            })
        })
}

export {
    embedText,
    vectorDBQuery
};