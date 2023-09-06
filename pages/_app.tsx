import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'react-redux'
import { store } from '@/utils/api/autogpt/redux/store'
import { SessionProvider } from "next-auth/react"
import { NextComponentType } from 'next'
import Header from '@/components/header'
import { useRouter } from 'next/router'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
//Add custom appProp type then use union to add it
type CustomAppProps = AppProps & {
  Component: NextComponentType & { auth?: boolean } // add auth type
}

export default function App({ Component, pageProps: { session, ...pageProps } }: CustomAppProps) {
  const router = useRouter();

  return (
    <Provider store={store}>
      <SessionProvider session={session} >
        <ChakraProvider>
          {!router.pathname.includes('login') &&
            <Header />
          }
          <Component {...pageProps} />


          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          {/* Same as */}
          <ToastContainer />
        </ChakraProvider>
      </SessionProvider>
    </Provider>
  )
}