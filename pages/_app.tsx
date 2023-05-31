import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'react-redux'
import { store } from '@/utils/api/autogpt/redux/store'
import { SessionProvider, useSession } from "next-auth/react"
import { useRouter } from 'next/router'
import { NextComponentType } from 'next'
import getDBEntry from '@/utils/api/db/getDBEntry'
import { getUser } from '@/utils/api/db/getUser'

//Add custom appProp type then use union to add it
type CustomAppProps = AppProps & {
  Component: NextComponentType & { auth?: boolean } // add auth type
}

export default function App({ Component, pageProps: { session, ...pageProps } }: CustomAppProps) {
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

function Auth({ children }: any) {
  // if `{required: true }` is supplied, `status` can only be "loading" or "authenticated"
  const router = useRouter();
  const session = useSession({ required: true })

  if (session && session.status === 'loading') {
    return (
      <div className="p bg-greyscale-grey-70 flex flex-row pt-24 pb-8 box-border items-center justify-center h-[94.5vh]">
      </div>
    );
  }
  else {

    if (session && session.data && session.data.user.isActive === false) {

      if (router.pathname !== '/payment') {
        console.log("olaaaa")
        router.push('/payment');
        // return children
      } else {
        console.log("olaaaa")
        return children
      }
    } else {
      return children
    }
  }

}