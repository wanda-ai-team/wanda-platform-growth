import axios from "axios";
import getDBEntry from "../db/getDBEntry";

async function getContext(email: string, platform: string) {
    let context = await getDBEntry("userSites", ['email'], ['=='], [email], 1);

    let prompt = ""
    switch(platform.toLocaleLowerCase()) {
        case "twitter":
            prompt = "What information do you have about the following business and landing page so that twitter threads can be created about it: " + context[0].data.businessName + " and " + context[0].data.url
            break;
        case "blog":
            prompt = "What information do you have about the following business and landing page so that blog posts can be created about it: " + context[0].data.businessName + " and " + context[0].data.url
            break;
        case "email":
            prompt = "What information do you have about the following business and landing page so that emails can be created about it: " + context[0].data.businessName + " and " + context[0].data.url
        default:
            break;
    }

    const documents = await axios.post(process.env.BACKEND_URL + '/llmTools/getEmbeddedContent', {
        userPrompt: prompt,
    },
        {
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${123}`
            }
        }
    );

    return documents.data
}

export {
    getContext
};