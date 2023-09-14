// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { OpenAIStream } from './openAIStream';
import { getContext } from '@/utils/api/context/contextCalls';
import { getOpenAIAnswer } from '@/utils/api/openAI/openAICalls';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export const config = {
    runtime: "edge",
};
const handler = async (req: NextRequest): Promise<NextResponse> => {

    const json = await req.json();
    console.log({ json });

    if (!json.email || !json.platform) {
        return new NextResponse("No email or platform", { status: 400 });
    }

    const documents = await getContext(json.email, json.platform)

    console.log(documents)
    const stream = await getOpenAIAnswer(json.idea + documents.page_content, json.platform + '-generation', true, )

    return stream
}

export default handler;