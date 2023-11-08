
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';
import { list } from "@vercel/blob";
import getDBEntry from "@/utils/api/db/getDBEntry";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        // Read a token from the environment variables
        const session = await getServerSession(req, res, authOptions)
        // Error handling

        console.log("error");
        if (!session?.user || !session?.user?.email) {
            return res.status(401).json({
                error: {
                    code: "no-access",
                    message: "You are not signed in.",
                },
            });
        }

        // Initialize
        const user = await getDBEntry("users", ["email"], ["=="], [session.user.email], 1);
        const slackAccessToken = user[0].data.slackAccessToken;

        const web = new WebClient(slackAccessToken);

        const { channelId } = req.body;
        let { message } = req.body;
        const { create } = req.body;
        const { listOfUsers } = req.body;
        const { channelName } = req.body;
        let newChannelId = "";
        let newChannel = null;
        if (create) {
            try {
                newChannel = await web.conversations.create({
                    name: channelName
                });
            } catch (e) {
                console.log(e);
            }

        }else{
            try {
                const currentChannel = await web.conversations.info({
                    channel: channelId.value
                });
                if(currentChannel && currentChannel.channel && !currentChannel.channel.is_member){
                    await web.conversations.join({
                        channel: channelId.value
                    });
                }
            } catch (e) {
                console.log(e);
            }
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
            const response = await web.chat.postMessage(message);
            console.log(response);
        })();


        res.status(200).json({ content: "No data found", success: false });
    } catch (error) {
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}