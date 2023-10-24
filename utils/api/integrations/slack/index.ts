async function getListOfUsers() {
    const users = await fetch('/api/integrations/slack/getListOfUsers').then((response) => response.json())
        .then(async (data) => {
            return data
        })
    return users.content
}

async function getListOfChannels() {
    const channels = await fetch('/api/integrations/slack/getListOfChannels').then((response) => response.json())
        .then(async (data) => {
            return data
        })
    return channels.content
}

async function sendMessageToChannel(message: string, channelId: string, create: boolean, listOfUsers: string, channelName: string) {
    const channels = await fetch('/api/integrations/slack/sendSlackMessage', {
        headers: {
            "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify({
            message: message,
            channelId: channelId,
            create: create,
            listOfUsers: listOfUsers,
            channelName: channelName
        })

    }).then((response) => response.json())
        .then(async (data) => {
            return data
        })
    return channels.content

}

export {
    getListOfUsers,
    getListOfChannels,
    sendMessageToChannel
};