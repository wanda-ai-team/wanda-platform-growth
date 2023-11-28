import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { ChatGPTMessage, ChatLine, LoadingChatLine } from '@/components/chatLine/chatLine'
import { InputMessage } from '@/components/chatLine/chatLineUser'
import Select from 'react-select'
import { salesPeopleList } from '@/utils/globalVariables'
import { Center, Text, VStack } from '@chakra-ui/react'
import { POSTApiCall, POSTApiCallWithoutJSON } from '@/utils/api/commonAPICall'

const COOKIE_NAME = 'wanda-chat-cookie'

// default first message to display in UI (not necessary to define the prompt)
export let initialMessages: ChatGPTMessage[] = [
  {
    role: 'assistant',
    content: 'Hi! I am your personal sales professiona! Ask me anything.',
    assistantName: 'AI',
  },
]
export default function SalesChat() {
  const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cookie, setCookie] = useCookies([COOKIE_NAME])
  const [selectedSalesPerson, setSelectedSalesPerson] = useState('')
  const [salesPeopleListSelect, setSalesPeopleListSelect] = useState(salesPeopleList.map((salesPerson) => ({ value: salesPerson, label: salesPerson })))

  useEffect(() => {
    if (!cookie[COOKIE_NAME]) {
      // generate a semi random short id
      const randomId = Math.random().toString(36).substring(7)
      setCookie(COOKIE_NAME, randomId)
    }
  }, [cookie, setCookie])

  // send message to API /api/chat endpoint
  const sendMessage = async (message: string) => {
    setLoading(true)
    const newMessages = [
      ...messages,
      { role: 'user', content: message } as ChatGPTMessage,
    ]
    setMessages(newMessages)
    const last10messages = newMessages.slice(-10) // remember last 10 messages

    const response = await POSTApiCallWithoutJSON('/api/backend/salesChat', {

      messages: last10messages,
      user: cookie[COOKIE_NAME],
    })


    if (!response.ok) {
      throw new Error(response.statusText)
    }

    // This data is a ReadableStream
    const data = response.body
    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    let lastMessage = ''

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)
      console.log('Chunk value:')
      console.log('Chunk value:', chunkValue)

      lastMessage = lastMessage + chunkValue

      setMessages([
        ...newMessages,
        { role: 'assistant', content: lastMessage, assistantName: selectedSalesPerson } as ChatGPTMessage,
      ])

      setLoading(false)
    }
  }

  return (
    <main className='h-[91vh]'>
      {
        !selectedSalesPerson ?
          <div className='mt-24'>
            <Center>
              <VStack>
                <Text fontSize="l" fontWeight="bold" color="gray.600" mb={4}>
                  Please select a sales person to chat with
                </Text>
                <Select
                  placeholder="Select a sales person"
                  options={salesPeopleListSelect}
                  onChange={(e) => {
                    initialMessages[0].assistantName = e!.value
                    setSelectedSalesPerson(e!.value)
                  }}
                />
              </VStack>
            </Center>
          </div>
          :
          <div className="rounded-2xl border-zinc-100  lg:border lg:p-6">

            {messages.map(({ content, role, assistantName }, index) => (
              <ChatLine key={index} role={role} content={content} assistantName={assistantName} />
            ))}

            {loading && <LoadingChatLine />}

            {messages.length < 2 && (
              <span className="mx-auto flex flex-grow text-gray-600 clear-both">
                Type a message to start the conversation
              </span>
            )}
            <InputMessage
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
            />
          </div>
      }
    </main>
  )
}