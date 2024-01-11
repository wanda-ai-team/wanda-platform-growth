
import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from '@slack/web-api';
import { openAICall } from "@/utils/api/openAI/openAICalls";
import createDBEntry from "@/utils/api/db/createDBEntry";
import { answerQuestion, assistantQuestion, createCaseStudyURL, createFollowUpEmail, createPieceOfContent, createPieceOfContentModal, sendEmail, transcribeVideoFile } from "@/utils/api/integrations/slack/bot";
import updateDBEntry from "@/utils/api/db/updateDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import { assistantQuestionBackend, transcribeSlackVideoFile } from "@/utils/api/backend/backendCalls";
import deleteDBEntry from "@/utils/api/db/deleteDBEntry";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {

        const { challenge } = req.body;
        if (challenge && challenge != "") {
            return res.status(200).json({ challenge });
        }

        let messageC;
        try {
            messageC = req.body.payload ? JSON.parse(req.body.payload) : req.body;
        } catch (error) {
            messageC = req.body
        }

        console.log(messageC)

        let slackExpert;
        try {
            slackExpert = await getDBEntry("slackExperts", ["slackBotTeamID"], ["=="], [messageC.team_id], 1)
        } catch (error) {
            slackExpert = await getDBEntry("slackExperts", ["slackBotTeamID"], ["=="], [messageC.user.team_id], 1)
        }

        const web = new WebClient(slackExpert[0].data.slackAccessToken);

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
                        await web.chat.postMessage({
                            channel: messageC.container.channel_id,
                            text: "Creating email, loading ...",
                        });
                        await answerQuestion(web, messageC, person[0].data.value, true);

                        break;
                    case "item":
                        await updateDBEntry("YCDemo", { value: messageC.actions[0].selected_option.value }, ['id'], '==', ["test"], 1);
                        break;
                    case "tommyActionGreat":

                        break;
                    case "tommyActionTellMeMore":

                        break;
                    case "tommyActionAskRealTommy":
                        await createDBEntry("realTommyQuestions", { threadTs: messageC.message.ts, text: messageC.message.blocks[0].text.text });
                        await web.chat.postMessage({
                            channel: process.env.TOMMY_CHANNEL as string,
                            text: "Asnwer the question as the real tommy(Wanda): " + messageC.message.blocks[0].text.text,
                            metadata: {
                                "event_type": "thread_from_real_tommy",
                                "event_payload": { threadTs: messageC.message.thread_ts, text: messageC.message.blocks[0].text.text, channelId: messageC.container.channel_id }
                            }
                        });
                        break;
                }

                break
            case "message_action":
                // const responseOpenAI = await openAICall(false, "userContent", "systemContent");
                (async () => {
                    await web.chat.postMessage({
                        channel: messageC.container.channel_id,
                        text: "Hello there",
                    });
                })();
                break
            case "event_callback":
                if (messageC.event.files && messageC.event.files.length > 0) {
                    const videoProcessing = await getDBEntry("botVideoProcessing", ["video"], ["=="], [messageC.event.files[0].url_private_download], 1);
                    if (videoProcessing.length == 0) {
                        await createDBEntry("botVideoProcessing", { video: messageC.event.files[0].url_private_download });

                        await web.chat.postMessage({
                            channel: messageC.event.channel,
                            // text: messageC.channel_name.split("talk-with-")[1] + " is answering \" " + messageC.text + "\", loading ...",
                            text: "Tommy is taking care of the file, loading...",
                            thread_ts: messageC.event.ts
                        });
                        await transcribeSlackVideoFile(messageC.event.channel, messageC.event.files[0].url_private_download, messageC.event.ts as string);
                        await deleteDBEntry("botVideoProcessing", ["video"], ["=="], [messageC.event.files[0].url_private_download], 1);
                    }
                    // await transcribeVideoFile(web, messageC);

                } else {
                    if (messageC.event.thread_ts && messageC.event.thread_ts != "") {
                        const threadContent = await web.conversations.replies({
                            channel: messageC.event.channel,
                            ts: messageC.event.thread_ts,
                            include_all_metadata: true
                        })

                        if (threadContent.messages && threadContent.messages.length > 0 && threadContent.messages[0].metadata?.event_type === "thread_from_real_tommy") {

                            console.log(threadContent.messages[0].metadata);
                            await web.chat.postMessage({
                                channel: messageC.event.channel,
                                // text: messageC.channel_name.split("talk-with-")[1] + " is answering \" " + messageC.text + "\", loading ...",
                                text: "Thank you for the answer",
                                thread_ts: messageC.event.thread_ts
                            });
                            const payload = threadContent.messages[0].metadata.event_payload;
                            if (payload && 'channelId' in payload && 'threadTs' in payload) {
                                await web.chat.postMessage({
                                    channel: payload?.channelId as string,
                                    text: messageC.event.text,
                                    thread_ts: payload.threadTs as string
                                })
                            }

                        }
                    } else {
                        const questionProcessing = await getDBEntry("botQuestionProcessing", ["question"], ["=="], [messageC.event.channel + "_" + messageC.event.text], 1);
                        if (questionProcessing.length == 0) {
                            await createDBEntry("botQuestionProcessing", { question: messageC.event.channel + "_" + messageC.event.text });

                            await web.chat.postMessage({
                                channel: messageC.event.channel,
                                // text: messageC.channel_name.split("talk-with-")[1] + " is answering \" " + messageC.text + "\", loading ...",
                                text: "Tommy is answering your question, loading...",
                                thread_ts: messageC.event.ts
                            });
                            await assistantQuestionBackend(messageC.event.channel, messageC.event.ts as string, messageC.event.text, web);
                            await deleteDBEntry("botQuestionProcessing", ["question"], ["=="], [messageC.event.channel + "_" + messageC.event.text], 1);
                        }
                    }
                }
                // await answerQuestion(web, messageC, "", false, true);
                break;
        }
        console.log("success")
        res.status(200).json({});
        return;
    } catch (error) {
        console.log("error")
        console.log(error)
        res.status(200).json({ content: error, success: false });
    }
}

