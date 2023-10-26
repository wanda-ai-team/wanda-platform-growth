async function POSTApiCall(url: string, body: any) {
    return await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    }).then((res) => res.json())
}

async function GETApiCall(url: string) {
    return await fetch(url).then((res) => res.json())
}

export {
    POSTApiCall,
    GETApiCall
}


      // condition: ['id'],
      // conditionOperation: ['=='],
      // conditionValue: [id],
      // numberOfConditions: 1,