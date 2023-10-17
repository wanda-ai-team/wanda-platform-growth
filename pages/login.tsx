import { useSession, getProviders } from "next-auth/react"
import Image from "next/image";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { authOptions } from "./api/auth/[...nextauth]";
import { useEffect } from "react";
import styles from '@/styles/Login.module.css'

export default function Login({ providers }: InferGetServerSidePropsType<typeof getServerSideProps>) {

  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session]);

  const router = useRouter()
  const popupCenter = (url: string | URL | undefined, title: string | undefined) => {
    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;
    const width =
      window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;

    const height =
      window.innerHeight ??
      document.documentElement.clientHeight ??
      screen.height;

    const systemZoom = width / window.screen.availWidth;

    const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
    const top = (height - 550) / 2 / systemZoom + dualScreenTop;

    const newWindow = window.open(
      url,
      title,
      `width=${500 / systemZoom},height=${550 / systemZoom
      },top=${top},left=${left}`
    );

    newWindow?.focus();
  };

  return (
    <>
      <div className={styles.main} >
        <div className={styles.block}>
          <Image
            className="z-[99]"
            alt=""
            width={130}
            height={26}
            src="/assets/logo/Logo.png"
          />
          <div className={styles.box}>
            <div>
              <h2> Welcome to Wanda! </h2>
            </div>
            <div>
              {Object.values(providers).map((provider: any) => (
                <div key={provider.name}>
                  <button className={styles.providerButton} onClick={() => popupCenter("/google-signin", "Sample Sign In")}>
                    {provider.name === 'Google' &&
                      <Image
                        className="pr-1 align-middle"
                        alt=""
                        width={24}
                        height={24}
                        src="/assets/icons/googleLogin.png"
                      />}
                    Sign in
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();

  return {
    props: { providers: providers ?? [] },
  }
}