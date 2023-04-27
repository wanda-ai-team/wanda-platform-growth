import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from "next-auth/react"
import { Provider } from 'react-redux'
import { store } from '@/utils/api/autogpt/redux/store'

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  return ( 
		<Provider store={store}>
    <SessionProvider session={session} >
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
    </Provider>
  )
}
