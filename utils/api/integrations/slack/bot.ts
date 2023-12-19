import { slackModalOutputPlatform } from "@/utils/globalVariables";
import { ChatPostMessageArguments, WebClient } from "@slack/web-api";
import e from "express";
import { Modal, Blocks, Elements, Bits, Message, StaticSelectBuilder } from 'slack-block-builder';
import { answerQuestionBackendCall, outputContent, outputContentBackendCall } from "../../backend/backendCalls";
import createDBEntry from "../../db/createDBEntry";
import getDBEntry from "../../db/getDBEntry";
import { openAICall } from "../../openAI/openAICalls";
import nodemailer from 'nodemailer';
import { OpenAIAssistantRunnable } from "langchain/experimental/openai_assistant";

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

async function answerQuestion(web: WebClient, messageC: any, person: any = "", isEmail: boolean = false, isMention: boolean = false) {
    try {
        let prompt = ""
        let responseOpenAI = "";
        let messageF: any = {};

        if (isMention) {
            await sleep(500);
            responseOpenAI = "Here you have a prospected list of 5 people that work on Google, that you can reach out to: \n"
                + "Please select one from the next list and create a personalized email to send to the prospect: \n"

            const menuOptions = [{ name: "Martim Pais, Online Marketing Sales Expert", id: "Martim Pais, Online Marketing Sales Expert" },
            { name: "João Guia, Territory Sales Manager", id: "João Guia, Territory Sales Manager" },
            { name: "Jacek Szymczyk, Head of Sales", id: "Jacek Szymczyk, Head of Sales" },
            { name: "Cesar Nogueira, EMEA Head of Sales", id: "Cesar Nogueira, EMEA Head of Sales" },
            { name: "Andrew Mesesan, Enterprise Sales Manager", id: "Andrew Mesesan, Enterprise Sales Manager" }]

            messageF = Message({ channel: messageC.event.channel, text: "Prospecting response" })
                .blocks(
                    responseOpenAI !== "" ? Blocks.Section({ text: responseOpenAI }) : Blocks.Section({ text: "No insights selected" }),
                    Blocks.Divider(),
                    Blocks.Actions()
                        .elements(
                            Elements.StaticSelect({ placeholder: 'Choose your favorite...' })
                                .actionId('item')
                                .options(menuOptions
                                    .map((item: { name: any; id: any; }) => Bits.Option({ text: item.name, value: item.id })))),
                    Blocks.Divider(),
                    Blocks.Actions()
                        .elements(
                            Elements.Button({ text: 'Create Personalized Email', actionId: 'createEmail' })),)
                .asUser()
                .buildToJSON();

            const responseSlack = JSON.parse(messageF)
            await web.chat.postMessage(responseSlack);
            return
        }
        console.log("entrei - 1")
        // const userInfo = await getDBEntry("users", ["slackAppId"], ["=="], [messageC.api_app_id], 1);
        // console.log(userInfo)
        // console.log(userInfo[0])

        // console.log(userInfo[0].data.slackBotTeam)

        // const expert = await getDBEntry("experts", ["expertName"], ["=="], [messageC.channel_name.split("talk-with-")[1]], 1);

        // const prompt = "You are " + messageC.channel_name.split("talk-with-")[1] + ", a hubspot sales professional, asnwering the following question based on the knowledge of how a hubspot sales professional does stuff\n "
        //     + "The query is being done by a sales person that works for the company " + "userInfo[0].data.slackBotTeam" + " you should use context from the company to answer the question\n"
        //     + "Question: "
        //     + messageC.text
        if (isEmail) {
            await sleep(250);
            console.log("entrei - no email")
            prompt = "You are a hubspot sales professional, answer the following question based on the knowledge of how a hubspot sales professional do sales. \n"
                + "The query is being done by a sales person that works for the company Wanda you should use context from the company to answer the question. \n"
                + "Write the email with good formatting and grammar, correctly make the separation between Subject: and Content:, and format the email as html, putting the correct HTML Elements on the email content body, and not anywhere else. \n"
                + "Question: You are Wei, the CPO of Wanda, write an email to " + person + ", EMEA Head of Sales where you are selling wanda to them, don't put placeholder content on the email, put the correct information to be ready to send. \n"
                + "Here is information about Wanda Wanda is selling an AI-powered tool that helps users repurpose their webinars into long-form social posts, enabling them to work more efficiently by automating content creation and distribution across multiple platforms. Wanda is selling it to Bloggers, podcasters, YouTubers, solopreneurs, lean startups, and digital marketing agencies and teams looking to maximize their online presence through content repurposing."

            responseOpenAI = await answerQuestionBackendCall(
                prompt
            )

            messageF = Message({ channel: messageC.container.channel_id, text: "Question response" })
                .blocks(
                    responseOpenAI !== "" ? Blocks.Section({ text: responseOpenAI }) : Blocks.Section({ text: "No insights selected" }),
                    Blocks.Divider(),
                    Blocks.Actions()
                        .elements(
                            Elements.Button({ text: 'Send Email', actionId: 'sendEmail' })
                        )
                )
                .asUser()
                .buildToJSON();

            const responseSlack = JSON.parse(messageF)
            await web.chat.postMessage(responseSlack);
        } else {
            await sleep(500);
            console.log("entrei - no else")
            responseOpenAI = "Here you have a prospected list of 10 people that work on Google, that you can reach out to: \n"
                + "Please select one from the next list and create a personalized email to send to the prospect: \n"

            const menuOptions = [{ name: "Martim Pais, Online Marketing Sales Expert", id: "Martim Pais, Online Marketing Sales Expert" },
            { name: "João Guia, Territory Sales Manager", id: "João Guia, Territory Sales Manager" },
            { name: "Jacek Szymczyk, Head of Sales", id: "Jacek Szymczyk, Head of Sales" },
            { name: "Cesar Nogueira, EMEA Head of Sales", id: "Cesar Nogueira, EMEA Head of Sales" },
            { name: "Andrew Mesesan, Enterprise Sales Manager", id: "Andrew Mesesan, Enterprise Sales Manager" }]

            messageF = Message({ channel: messageC.channel_id, text: "Prospecting response" })
                .blocks(
                    responseOpenAI !== "" ? Blocks.Section({ text: responseOpenAI }) : Blocks.Section({ text: "No insights selected" }),
                    Blocks.Divider(),
                    Blocks.Actions()
                        .elements(
                            Elements.StaticSelect({ placeholder: 'Choose your favorite...' })
                                .actionId('item')
                                .options(menuOptions
                                    .map((item: { name: any; id: any; }) => Bits.Option({ text: item.name, value: item.id })))),
                    Blocks.Divider(),
                    Blocks.Actions()
                        .elements(
                            Elements.Button({ text: 'Create Personalized Email', actionId: 'createEmail' })),)
                .asUser()
                .buildToJSON();

            const responseSlack = JSON.parse(messageF)
            await web.chat.postMessage(responseSlack);
            // messageF.channel = messageC.channel_id;
        }

        // let responseOpenAI = "";
        // responseOpenAI = "Hello, how are you?"
        // const responseOpenAI = await openAICall(false, messageC.text,
        //     "You are a professional sales person.");

        // const newUseCase = await createDBEntry("useCases", { content: responseOpenAI, title: "Case Study", type: "caseStudy", meetingTitle: messageC.message.blocks[0].text.text });




    } catch (error) {
        console.log("error")
        console.log(error)
        await web.chat.postMessage({
            channel: messageC.channel_id,
            text: "Error answering the question, please try again later",
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

function sleep(ms: number | undefined) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function sendEmail(web: any, messageC: any) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "wei@wanda.so",
                pass: process.env.GOOGLE_PASS,
            }
        });

        const mailRes = await transporter.sendMail({
            from: 'wei@wanda.so',
            to: messageC.message.blocks[0].text.text.split("Dear ")[1].split(" ")[0] + "@google.com",
            subject: messageC.message.blocks[0].text.text.split("Subject:")[1].split("Content:")[0].trim(),
            html: messageC.message.blocks[0].text.text.split("Content:")[1].replaceAll("&lt;", "<").replaceAll("&gt;", ">")
        });

        console.log(mailRes)

        await sleep(500);
        await web.chat.postMessage({
            channel: messageC.container.channel_id,
            text: "Email sent!",
        });
    } catch (error) {
        console.log(error)
        await sleep(500);
        await web.chat.postMessage({
            channel: messageC.container.channel_id,
            text: "Error while sending email, please try again later",
        });
    }
}

async function sendEmailTest(messageC: any) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "wei@wanda.so",
                pass: process.env.GOOGLE_PASS,
            }
        });


        const mailRes = await transporter.sendMail({
            from: 'wei@wanda.so',
            to: "joao.airesmatos@gmail.com",
            subject: messageC.message,
            html: messageC
        });

        console.log(mailRes)

        await sleep(500);
        // await web.chat.postMessage({
        //     channel: messageC.container.channel_id,
        //     text: "Email sent!",
        // });
    } catch (error) {
        console.log(error)
        await sleep(500);
        // await web.chat.postMessage({
        //     channel: messageC.container.channel_id,
        //     text: "Error while sending email, please try again later",
        // });
    }
}

async function assistantQuestion(web: any, messageC: any) {
    const assistant = new OpenAIAssistantRunnable({
        assistantId: "asst_oIJmwVBHJoWJ5ZK7TgSiRX1y",
        asAgent: false,
    });
    const assistantResponse = await assistant.invoke({
        content: messageC.text,
    });
    console.log("1")
    console.log(assistantResponse)
    if(Array.isArray(assistantResponse) && assistantResponse.length > 0){
        if ("content" in assistantResponse[0] && "text" in assistantResponse[0].content[0]) {
            console.log("1")
            console.log(assistantResponse[0].content[0])
            await web.chat.postMessage({
                channel: messageC.channel_id,
                text: assistantResponse[0].content[0].text.value,
            });
        }
}
}

async function assistantQuestionTest(){
    
    const assistant = new OpenAIAssistantRunnable({
        assistantId: "asst_oIJmwVBHJoWJ5ZK7TgSiRX1y",
    });

    console.log("entrei")
    console.log(assistant)
    const assistantResponse = await assistant.invoke({
        content: "messageC.text",
    });

    console.log(Array.isArray(assistantResponse))

    // await web.chat.postMessage({
    //     channel: messageC.channel_id,
    //     text: assistantResponse,
    // });
}


export {
    createCaseStudyURL,
    createPieceOfContentModal,
    createPieceOfContent,
    createFollowUpEmail,
    answerQuestion,
    sendEmail,
    sendEmailTest,
    assistantQuestion,
    assistantQuestionTest
};
