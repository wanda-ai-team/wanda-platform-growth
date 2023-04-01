import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react";

export default function Login() {
  console.log("Login page")
  console.log(process.env.FIREBASE_API_KEY)

  const { data: session, status } = useSession();
  
  useEffect(() => {
    console.log("status");
    if (session) {

        console.log("status1");   
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
      <button onClick={() => popupCenter("/twitter-signin", "Sample Sign In")} >
        Sign In with twitter
      </button>
    </>
  )
}