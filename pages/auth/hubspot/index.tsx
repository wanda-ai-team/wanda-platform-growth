import { generateCustomerToken } from "@/utils/common/integrations/integrationsURLs";
import toastDisplay from "@/utils/common/toast";
import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function HubspotAuth() {
    const router = useRouter();

    async function generateCustomerToken(code: any) {
        await fetch("/api/integrations/hubspot/generateCustomerToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: code }),
        }).then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    toastDisplay("Hubspot connected successfully", true)
                    router.push("/profile");
                }
            }
            ).catch((err) => {
                console.log(err)
                toastDisplay("Error with Hubspot", false)
                router.push("/profile");
            });

    }

    useEffect(() => {
        const { code } = router.query;
        if (code !== undefined) {
            generateCustomerToken(code);
        }
    }, [router])
    return (
        <>
            <Center h='100vh'>
                <VStack>
                    <Text as="h2" fontSize="1xl">
                        Connecting to Hubspot ....
                    </Text>
                    <Spinner
                        thickness='4px'
                        speed='0.65s'
                        emptyColor='gray.200'
                        color='blue.500'
                        size='xl' />
                </VStack>
            </Center>
        </>
    )
}

HubspotAuth.auth = true;