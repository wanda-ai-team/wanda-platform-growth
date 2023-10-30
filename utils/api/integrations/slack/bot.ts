import { slackModalOutputPlatform } from "@/utils/globalVariables";
import { WebClient } from "@slack/web-api";
import { Modal, Blocks, Elements, Bits, Message } from 'slack-block-builder';
import createDBEntry from "../../db/createDBEntry";
import { openAICall } from "../../openAI/openAICalls";

async function createCaseStudyURL(web: WebClient, messageC: any) {
    await web.chat.postMessage({
        channel: messageC.container.channel_id,
        text: "Loading case study response ...",
    });

    const responseOpenAI = await openAICall(false, "Create me a study case based on the give topics that were talked about during the client meeting\n Topics:"
        + messageC.message.blocks[2].text.text,
        "You are a professional customer success manager");

    const newUseCase = await createDBEntry("useCases", { content: responseOpenAI, title: "Case Study", type: "caseStudy", meetingTitle: messageC.message.blocks[0].text.text });

    const response = await web.chat.postMessage({
        channel: messageC.container.channel_id,
        text: "<@" + messageC.user.id + "> The use case was created and can be found here: " + process.env.NEXT_PUBLIC_URL + "/slack/casestudy/" + newUseCase.id,
    });
}


async function createPieceOfContent(web: WebClient, messageC: any) {

    let value: any = {};
    value = (Object.values(messageC.view.state.values)[0])
    let fValue = value.item.selected_option.value
    console.log(messageC.view.private_metadata.split)


    await web.chat.postMessage({
        channel: messageC.view.private_metadata.split(":")[0],
        text: "Creating piece of content, loading ...",
    });

    const responseOpenAI = await openAICall(false, "Create me a " + fValue + " post " + " based on the give topics that were talked about during the client meeting\n Topics:"
        + messageC.view.private_metadata.split(":")[1],
        "You are a professional content creator with millions of followers");

    // const newUseCase = await createDBEntry("useCases", { content: responseOpenAI, title: "Case Study", type: "caseStudy", meetingTitle: messageC.message.blocks[0].text.text });
    const response = await web.chat.postMessage({
        channel: messageC.container.channel_id,
        text: responseOpenAI,
    });
}

async function createPieceOfContentModal(web: WebClient, trigger_id: string, message: any) {
    try {
        const modal = Modal({ title: 'Repurpose', submit: 'Repurpose', privateMetaData: message.container.channel_id + ":" + message.message.blocks[2].text.text })
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
        console.log(modal)
        await web.views.open({
            trigger_id: trigger_id,
            view: JSON.parse(modal)
        });
    } catch (error) {
        console.log(error)
    }
}


async function createFollowUpEmail(web: WebClient, messageC: any) {
    await web.chat.postMessage({
        channel: messageC.container.channel_id,
        text: "Creating follow up email ...",
    });

    const responseOpenAI = await openAICall(false, "Create me a followup email to send to the client, based on the given topics that were talked about on a client call. \n Topics:"
        + messageC.message.blocks[2].text.text,
        "You are a professional customer success manager");

    await web.chat.postMessage({
        channel: messageC.container.channel_id,
        text: "<@" + messageC.user.id + "> Here you have the draft email:\n" + "----email----\n\n" + responseOpenAI,
    });
}


export {
    createCaseStudyURL,
    createPieceOfContentModal,
    createPieceOfContent,
    createFollowUpEmail
};