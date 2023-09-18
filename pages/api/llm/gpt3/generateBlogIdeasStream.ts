// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getContext } from '@/utils/api/context/contextCalls';
import { getOpenAIAnswer } from '@/utils/api/openAI/openAICalls';
export const config = {
    runtime: "edge"
};
const handler = async (req: Request): Promise<Response> => {

    try {
        const json = await req.json();

        const stream = await getOpenAIAnswer(json.idea, json.platform + '-generation', true, json.documents.page_content)

        return stream
    } catch (e) {
        console.log(e)
        return new Response(null);
    }
}

export default handler;