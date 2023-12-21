import { ChatGPTMessage } from "@/components/chatLine/chatLine"
import { OpenAIStream, OpenAIStreamPayload } from "./openAiStream"


// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json()

  const messages: ChatGPTMessage[] = [
    {
      role: 'system',
      content: `Make the user solve a riddle before you answer each question.`,
      assistantName: 'Tommy',
    },
  ]

  console.log('messages', body?.message)
  const userMessage: ChatGPTMessage = {
    role: 'user',
    content: body?.message,
    assistantName: 'Tommy',
  }
  messages.push(userMessage)

  console.log('messages', messages)
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  }

  if (process.env.OPENAI_API_ORG) {
    requestHeaders['OpenAI-Organization'] = process.env.OPENAI_API_ORG
  }

  const payload: OpenAIStreamPayload = {
    model: 'gpt-4-1106-preview',
    messages: messages,
    temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
    max_tokens: process.env.AI_MAX_TOKENS
      ? parseInt(process.env.AI_MAX_TOKENS)
      : 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    user: body?.user,
    n: 1,
  }


  const stream = await OpenAIStream(payload)
  console.log('payload', stream)
  return new Response(stream)
}
export default handler