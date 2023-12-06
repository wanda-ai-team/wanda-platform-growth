import { GETApiCall, POSTApiCall } from "@/utils/api/commonAPICall";
import toastDisplay from "@/utils/common/toast";
import { Mixpanel } from "@/utils/mixpanel";
import { Center, Spinner, Stack, Box, Badge, Button, HStack } from "@chakra-ui/react";
import { push } from "mixpanel-browser";
import { use, useEffect, useState } from "react";

export default function ExpertList() {
    const [loadingExperts, setLoadingExperts] = useState(false)
    const [experts, setExperts] = useState([])

    async function getExperts() {
        setLoadingExperts(true)
        Mixpanel.track("On Expert page clicked on create");

        let installedExperts = await POSTApiCall('/api/user/getSpecificUserInfo', {
            info: ["slackExperts"],
        })
        let experts: any = []
        await GETApiCall('/api/expert/getExperts').then((result) => {
            toastDisplay("Experts loaded", true)
            experts = result.content.map((expert: any) => { return expert.data })
        }).catch((error) => {
            toastDisplay("Error in creating expert", false)
            console.log(error)
        })


        if (installedExperts.content.length > 0) {
            installedExperts = installedExperts.content[0].slackExperts
            experts = experts.map((expert: any) => {
                if (installedExperts.includes(expert.id)) {
                    expert.isInstalled = true
                } else {
                    expert.isInstalled = false
                }
                return expert
            })
        }

        setExperts(experts)
        console.log(experts)
        setLoadingExperts(false)
    }

    async function createExpertChannel(expertId: any) {
        console.log(expertId)
        Mixpanel.track("On Expert page clicked on create");
        await POSTApiCall('/api/integrations/slack/createExpertChannel', {
            expertId: expertId
        }).then((result) => {
            if (result.status === 200) {
                toastDisplay("Expert installed successfully", true)
                let expertsF: any;
                expertsF = experts.map((expert: any) => {
                    if (expert.id === expertId) {
                        expert.isInstalled = true
                    }
                })
                setExperts(expertsF)
            } else {
                toastDisplay("Error while installing expert", false)
            }
            console.log(result)
        }).catch((error) => {
            toastDisplay("Error in creating expert", false)
            console.log(error)
        })
    }

    async function deleteExpertChannel(expertId: any) {
        console.log(expertId)
        // await POSTApiCall('/api/integrations/slack/deleteExpertChannel', {
        //     expertId: expertId
        // }).then((result) => {
        //     if (result.status === 200) {
        //         toastDisplay("Expert installed successfully", true)
        //     } else {
        //         toastDisplay("Error while installing expert", false)
        //     }
        //     console.log(result)
        // }).catch((error) => {
        //     toastDisplay("Error in creating expert", false)
        //     console.log(error)
        // })
    }

    useEffect(() => {
        getExperts()
    }, []);

    function boxWithBadge(title: string, description: string, onClickFunction: any, expertId: any, expertInstalled: any, onClickFunctionUninstalled: any) {
        return (
            <Box as='button' maxW='350px' borderWidth='1px' borderRadius='lg' onClick={expertInstalled ? onClickFunctionUninstalled : onClickFunction}>
                <Box p='6' alignItems='center'>
                    <Stack direction='column' spacing={8}>
                        <Badge borderRadius='full' colorScheme='purple'>
                            <Box alignItems='center' as='span' fontSize='20px'>
                                {title}
                            </Box>
                        </Badge>
                        <Box>
                            <Box as='span' color='gray.600' fontSize='sm'>
                                {description}
                            </Box>
                        </Box>
                        <Box>
                            <Button
                                // isLoading={loadingCreation}
                                size='sm'
                                colorScheme={expertInstalled ? "red" : "purple"}
                                value={expertId}
                            // isDisabled={experName === '' || expertDescription === '' || creatorName === '' || creatorURL === '' || creatorKnowledge === ''}
                            // onClick={() => createExpert()}
                            // onClick={() => router.push('/insights')}
                            >
                                {expertInstalled ? "Uninstall" : "Install"}
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Box>
        )
    }
    return (
        <>
            <Center mt={"56px"}>
                {loadingExperts ? (
                    <Spinner />
                ) : (
                    <HStack spacing={8} >
                        {experts.map((expert: any) => (
                            boxWithBadge(expert.expertName, expert.expertDescription,
                                (e: any) => { createExpertChannel(e.target.value) },
                                expert.id,
                                expert.isInstalled,
                                (e: any) => { deleteExpertChannel(e.target.value) })
                        ))}
                    </HStack>
                )}
            </Center>
        </>
    )
}