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
import { pagesWithoutHeader } from '@/utils/globalVariables'
type CustomAppProps = AppProps & {
  Component: NextComponentType & { auth?: boolean }
}


export default function App({ Component, pageProps: { session, ...pageProps } }: CustomAppProps) {
  const router = useRouter();


  return (
    <Provider store={store}>
      <SessionProvider session={session} >
        <ChakraProvider>
          {!pagesWithoutHeader.includes(router.pathname) &&
            <Header />
          }
          {Component.auth ? (
            <Auth>
              <Component {...pageProps} className='h-[94.5vh]' />
            </Auth>
          ) : (
            <Component {...pageProps} className='h-[94.5vh]' />
          )}
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
          <ToastContainer />
        </ChakraProvider>
      </SessionProvider>
    </Provider>
  )
}

function Auth({ children }: any) {
  const router = useRouter();
  const session = useSession({ required: true })
  if (session && session.status === 'loading') {
    return (
      <div className="p bg-greyscale-grey-70 flex flex-row pt-24 pb-8 box-border items-center justify-center h-[94.5vh]">
      </div>
    );
  }
  else {
    console
    if ((session && session.data && session.data.user.isActive === false) && !router.pathname.includes('stripeSession')) {
      if (router.pathname !== '/payment') {
        router.push('/payment');
      }
    } else {
      if (router.pathname === '/payment') {
        router.push('/');
      }
      return children
    }
  }

}

// export async function getServerSideProps() {
//   const session = useSession({ required: true })
//   let userIsActive = false;

//   if (session && session.data && session.data.user.isActive === false) {
//     userIsActive = false;
//   } else {
//     userIsActive = true;
//   }
//   console.log("userIsActive")
//   console.log(userIsActive)
//   return { props: { userIsActive } };
// }