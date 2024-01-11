
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';
import { answerQuestion } from "@/utils/api/integrations/slack/bot";
import axios from "axios";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        // Read a token from the environment variables
        const token = process.env.SLACK_TOKEN;

        const web = new WebClient(token);
        let messageC;
        try {
            messageC = JSON.parse(req.body)
        } catch (error) {
            messageC = req.body
        }

        console.log(messageC)
        

        return res.status(200).json("Question being answered!");
    } catch (error) {
        console.log("error")
        console.log(error)
        return res.status(400).json({ content: error, success: false });
    }
}