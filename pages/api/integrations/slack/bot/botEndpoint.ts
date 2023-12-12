
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

        const { challenge } = req.body;
        if (challenge && challenge != "") {
            return res.status(200).json({ challenge });
        }
        // Read a token from the environment variables
        const token = process.env.SLACK_TOKEN;

        // Initialize
        const web = new WebClient(token);
        let messageC;
        try {
            messageC = req.body.payload 
            console.log("ola1")
            console.log(req.body)
            console.log(messageC)
            console.log("TYPE")
            // console.log(messageC.type)
        } catch (error) {
            console.log("req.body.payload")
            console.log("ola2")
            console.log(req.body)
            messageC = req.body
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
                        await sendEmail(web, messageC);
                        break;
                    case "createEmail":
                        const person = await getDBEntry("YCDemo", ["id"], ["=="], ["test"], 1);
                        console.log(person)
                        answerQuestion(web, messageC, person[0].data.value, true);

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
            case "event_callback":
                await web.chat.postMessage({
                    channel: messageC.event.channel,
                    // text: messageC.channel_name.split("talk-with-")[1] + " is answering \" " + messageC.text + "\", loading ...",
                    text: "Tommy is answering \"" + messageC.event.text.split(">")[1] + "\", loading ...",
                });

                await answerQuestion(web, messageC, "", false, true);
                break;
        }

        res.status(200).json({});
    } catch (error) {
        console.log("error")
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}

