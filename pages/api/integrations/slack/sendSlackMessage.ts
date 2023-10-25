
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';
import { list } from "@vercel/blob";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        // Read a token from the environment variables
        const token = process.env.SLACK_TOKEN;

        // Initialize
        const web = new WebClient(token);

        const { channelId } = req.body;
        let { message } = req.body;
        const { create } = req.body;
        const { listOfUsers } = req.body;
        const { channelName } = req.body;
        let newChannelId = "";
        let newChannel = null;
        if (create) {
            newChannel = await web.conversations.create({
                name: channelName
            });

        }

        if (newChannel && newChannel.channel && newChannel.channel.id) {
            newChannelId = newChannel.channel.id;
        } else {
            newChannelId = channelId.value
        }

        if (listOfUsers.length > 0) {
            try {
                await web.conversations.invite({
                    users: listOfUsers,
                    channel: newChannelId
                })
            } catch (e) {
                console.log(e);
            }
        }

        message = JSON.parse(message);

        message.channel = newChannelId;

        (async () => {
            await web.chat.postMessage(message);
        })();


        res.status(200).json({ content: "No data found", success: false });
    } catch (error) {
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}