
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';
import { openAICall } from "@/utils/api/openAI/openAICalls";
import createDBEntry from "@/utils/api/db/createDBEntry";
import { answerQuestion, createCaseStudyURL, createFollowUpEmail, createPieceOfContent, createPieceOfContentModal, sendEmail } from "@/utils/api/integrations/slack/bot";
import updateDBEntry from "@/utils/api/db/updateDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {

        // Read a token from the environment variables
        const token = process.env.SLACK_TOKEN;

        // Initialize
        const web = new WebClient(token);
        let messageC;
        try {
            console.log(JSON.parse(req.body.payload))

            messageC = JSON.parse(req.body.payload)
        } catch (error) {
            messageC = req.body.payload
        }

        switch (messageC.type) {
            case "view_submission":
                switch (messageC.view.title.text) {
                    case "Repurpose":
                        await web.chat.postMessage({
                            channel: messageC.view.private_metadata.split(":")[0],
                            text: "Creating piece of content, loading ...",
                        });
                        createPieceOfContent(web, messageC);
                        break;
                }
                break
            case "block_actions":
                switch (messageC.actions[0].action_id) {
                    case "createCaseStudy":
                        await createCaseStudyURL(web, messageC);
                        break;
                    case "createPieceOfContent":
                        await createPieceOfContentModal(web, messageC.trigger_id, messageC);
                        break;
                    case "followUpEmail":
                        await createFollowUpEmail(web, messageC);
                        break;
                    case "sendEmail":
                        await sendEmail(messageC);
                        break;
                    case "createEmail":
                        const person = await getDBEntry("YCDemo", ["id"], ["=="], ["test"], 1);
                        console.log(person)
                        answerQuestion(web, messageC, person[0].value, true);

                        await web.chat.postMessage({
                            channel: messageC.container.channel_id,
                            text: "Creating email, loading ...",
                        });
                        break;
                    case "item":
                        await updateDBEntry("YCDemo", { value: messageC.actions[0].selected_option.value }, ['id'], '==', ["test"], 1);
                        break;
                }

                break
            case "message_action":
                // const responseOpenAI = await openAICall(false, "userContent", "systemContent");
                (async () => {
                    const response = await web.chat.postMessage({
                        channel: messageC.container.channel_id,
                        text: "Hello there",
                    });
                    console.log(response);
                })();
                break
        }

        res.status(200).json({});
    } catch (error) {
        console.log("error")
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}

