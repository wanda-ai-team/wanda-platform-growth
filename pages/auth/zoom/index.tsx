import { generateCustomerToken } from "@/utils/common/integrations/integrationsURLs";
import toastDisplay from "@/utils/common/toast";
import { Center, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function ZoomAuth() {
    const router = useRouter();

    async function generateCustomerToken(code: any, state: any) {
        await fetch("/api/integrations/gong/generateCustomerToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: code, state: state }),
        });
        toastDisplay("Gong connected successfully", true)
        router.push("/profile");
    }

    useEffect(() => {
        console.log(router.query)
        // const { code } = router.query;
        // const { state } = router.query;
        // if (code !== undefined && state !== undefined) {
        //     // generateCustomerToken(code, state);
        // }
    }, [router])
    return (
        <>
            <Center h='80vh'>
                <Spinner
                    thickness='4px'
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='blue.500'
                    size='xl' />
            </Center>
        </>
    )
}

ZoomAuth.auth = true;