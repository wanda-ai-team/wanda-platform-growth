import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";


const SignInPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        console.log("status");
        if (!(status === "loading") && !session) {
            void signIn("twitter");
        }
        if (session) {
            window.close();
            router.push("/");
        }
    }, [session, status]);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                position: "absolute",
                left: 0,
                top: 0,
                background: "white",
            }}
        ></div>
    );
};

export default SignInPage;