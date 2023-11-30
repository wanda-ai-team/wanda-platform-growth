import { slackModalOutputPlatform } from "@/utils/globalVariables";
import { WebClient } from "@slack/web-api";
import { Modal, Blocks, Elements, Bits, Message } from 'slack-block-builder';
import { answerQuestionBackendCall, outputContent, outputContentBackendCall } from "../../backend/backendCalls";
import createDBEntry from "../../db/createDBEntry";
import getDBEntry from "../../db/getDBEntry";
import { openAICall } from "../../openAI/openAICalls";

async function createCaseStudyURL(web: WebClient, messageC: any) {
    try {
        await web.chat.postMessage({
            channel: messageC.container.channel_id,
            text: "Loading case study response ...",
        });

        const responseOpenAI = await outputContentBackendCall("", "casestudy", messageC.message.blocks[0].text.text.split("id_")[1])

        const newUseCase = await createDBEntry("useCases", { content: responseOpenAI, title: "Case Study", type: "caseStudy", meetingTitle: messageC.message.blocks[0].text.text });

        await web.chat.postMessage({
            channel: messageC.container.channel_id,
            text: "<@" + messageC.user.id + "> The use case was created and can be found here: " + process.env.NEXT_PUBLIC_URL + "/slack/casestudy/" + newUseCase.id,
        });
    } catch (error) {
        console.log(error)
        await web.chat.postMessage({
            channel: messageC.container.channel_id,
            text: "Error creating case study, please try again later",
        });
    }

}


async function createPieceOfContent(web: WebClient, messageC: any) {
    try {
        let value: any = {};
        value = (Object.values(messageC.view.state.values)[0])
        let fValue = value.item.selected_option.value
        console.log(messageC.view.private_metadata.split)

        const responseOpenAI = await outputContentBackendCall(messageC.view.private_metadata.split(":")[1], fValue, messageC.view.private_metadata.split(":")[1])

        // const responseOpenAI = await openAICall(false, "Create me a " + fValue + " post " + " based on the give topics that were talked about during the client meeting\n Topics:"
        //     + messageC.view.private_metadata.split(":")[1],
        //     "You are a professional content creator with millions of followers");

        // const newUseCase = await createDBEntry("useCases", { content: responseOpenAI, title: "Case Study", type: "caseStudy", meetingTitle: messageC.message.blocks[0].text.text });
        await web.chat.postMessage({
            channel: messageC.view.private_metadata.split(":")[0],
            text: "<@" + messageC.view.private_metadata.split(":")[3] + "> Here you have the draft for a " + fValue + ":\n" + "----" + fValue + "----\n\n" + responseOpenAI,
        });

    } catch (error) {
        console.log(error)
        await web.chat.postMessage({
            channel: messageC.view.private_metadata.split(":")[0],
            text: "Error creating piece of content, please try again later",
        });
    }
}

async function answerQuestion(web: WebClient, messageC: any) {
    try {

        console.log("entrei - 1")
        console.log(messageC)
        console.log(messageC.api_app_id)
        const userInfo = await getDBEntry("users", ["slackAppId"], ["=="], [messageC.api_app_id], 1);
        console.log(userInfo)
        console.log(userInfo[0])
        
        console.log(userInfo[0].data.slackBotTeam)

        const prompt = "You are tommy, a hubspot sales professional, asnwering the following question based on the knowledge of how a hubspot sales professional does stuff\n "
            + "The query is being done by a sales person that works for the company " + userInfo[0].data.slackBotTeam + " you should use context from the company to answer the question\n"
            + "Question: "
            + messageC.text
        console.log("ola")
        console.log(prompt)
        const responseOpenAI = await answerQuestionBackendCall(
            prompt
        )

        console.log("ola2")
        // const responseOpenAI = await openAICall(false, messageC.text,
        //     "You are a professional sales person.");

        // const newUseCase = await createDBEntry("useCases", { content: responseOpenAI, title: "Case Study", type: "caseStudy", meetingTitle: messageC.message.blocks[0].text.text });
        await web.chat.postMessage({
            channel: messageC.channel_id,
            text: "<> Here you have the answer for your question\n" + "--------\n\n" + responseOpenAI,
        });

    } catch (error) {
        console.log("error")
        console.log(error)
        await web.chat.postMessage({
            channel: messageC.channel_id,
            text: "Error creating piece of content, please try again later",
        });
    }
}

async function createPieceOfContentModal(web: WebClient, trigger_id: string, message: any) {
    try {
        const modal = Modal({ title: 'Repurpose', submit: 'Repurpose', privateMetaData: message.container.channel_id + ":" + message.message.blocks[0].text.text.split("id_")[1] + ":" + trigger_id + ":" + message.user.id })
            .blocks(
                Blocks.Section({ text: 'Let\' repurpose this piece of content!' }),
                Blocks.Input({ label: 'What\s the output platform?' })
                    .element(
                        Elements.StaticSelect({ placeholder: 'Choose output platform...' })
                            .actionId('item')
                            .options(
                                slackModalOutputPlatform.map((platform) => {
                                    return Bits.Option({ text: platform.platform, value: platform.platform })
                                })))
            ).buildToJSON();
        await web.views.open({
            trigger_id: trigger_id,
            view: JSON.parse(modal)
        });
    } catch (error) {
        console.log(error)
    }
}


async function createFollowUpEmail(web: WebClient, messageC: any) {
    try {
        await web.chat.postMessage({
            channel: messageC.container.channel_id,
            text: "Creating follow up email ...",
        });

        await web.chat.postMessage({
            channel: messageC.container.channel_id,
            text: "call id " + messageC.message.blocks[0].text.text.split("id_")[1] + " topics " + messageC.message.blocks[2].text.text,
        });

        const responseOpenAI = await outputContentBackendCall("", "followupemail", messageC.message.blocks[0].text.text.split("id_")[1])

        // const responseOpenAI = await openAICall(false, "Create me a followup email to send to the client, based on the given topics that were talked about on a client call. \n Topics:"
        //     + messageC.message.blocks[2].text.text,
        //     "You are a professional customer success manager");

        await web.chat.postMessage({
            channel: messageC.container.channel_id,
            text: "<@" + messageC.user.id + "> Here you have the draft email:\n" + "----email----\n\n" + responseOpenAI,
        });
    } catch (error) {
        console.log(error)
        await web.chat.postMessage({
            channel: messageC.container.channel_id,
            text: "Error creating follow-up email, please try again later",
        });
    }
}


export {
    createCaseStudyURL,
    createPieceOfContentModal,
    createPieceOfContent,
    createFollowUpEmail,
    answerQuestion
};
