import { useRouter } from "next/router";
import {  useEffect } from "react";

export default function GongAuth() {
    const router = useRouter();

    useEffect(() => {
        const { code } = router.query;
        console.log(code)
    }, [])
    return (
        <>
            
        </>
    )
}

GongAuth.auth = true;