

import styles from "@/styles/HomeN.module.css";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function StripeSession() {
    const { data: session, update } = useSession();
    const router = useRouter();

    async function updateSession() {
        console.log(session)
        const newSession = {
            ...session,
            user: {
                ...session?.user,
                isActive: true
            },
        };
        
        const a = await update(newSession);
        console.log(a)
        router.push('/');
    }

    useEffect(() => {
        updateSession();
    }, []);

    return (
        <main className={styles.main}>
          
        </main>
    )
}

StripeSession.auth = true;