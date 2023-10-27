import { slackModalOutputPlatform } from "@/utils/globalVariables";
import { WebClient } from "@slack/web-api";
import { Modal, Blocks, Elements, Bits } from 'slack-block-builder';
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

async function createPieceOfContentModal(web: WebClient, trigger_id: string) {
    try {
        const modal = Modal({ title: 'PizzaMate', submit: 'Get Fed' })
            .blocks(
                Blocks.Section({ text: 'Let\' repurpose this piece of content!' }),
                Blocks.Section({ text: 'Hurray for corporate pizza! Let\'s get you fed and happy :pizza:' }),
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

export {
    createCaseStudyURL,
    createPieceOfContentModal
};