import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'react-redux'
import { store } from '@/utils/api/autogpt/redux/store'
import { SessionProvider, useSession } from "next-auth/react"
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
          {!router.pathname.includes('login') && !router.pathname.includes('payment') && router.pathname !== "/" &&
            <Header />
          }
          {/* {false ? (
            <Auth>
              <Component {...pageProps} className='h-[94.5vh]' />
            </Auth>
          ) : (
            <Component {...pageProps} className='h-[94.5vh]' />
          )} */}
            <Component {...pageProps} className='h-[94.5vh]' />



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

function Auth({ children }: any) {
  // if `{required: true }` is supplied, `status` can only be "loading" or "authenticated"
  const router = useRouter();
  console.log(router.pathname)
  const session = useSession({ required: true })
  console.log(session)
  if (session && session.status === 'loading') {
    return (
      <div className="p bg-greyscale-grey-70 flex flex-row pt-24 pb-8 box-border items-center justify-center h-[94.5vh]">
      </div>
    );
  }
  else {
    if (session && session.data && session.data.user.isActive === false) {
      if(router.pathname !== '/payment'){
        router.push('/payment');
      }
    } else {
      return children
    }
  }

}