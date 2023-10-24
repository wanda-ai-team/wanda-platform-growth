
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        // Read a token from the environment variables
        const token = process.env.SLACK_TOKEN;

        // Initialize
        const web = new WebClient(token);
        let filteredChannels: any[] = [];

        await (async () => {
            let channels = await web.conversations.list();
            if (channels && channels.channels) {
                filteredChannels = channels.channels.map((channel: any) => { return { id: channel.id, name: channel.name } });
            }
        })();

        res.status(200).json({ content: filteredChannels, success: true });
    } catch (error) {
        res.status(200).json({ content: error, success: false });
    }
}