import { GETApiCall, POSTApiCall } from "@/utils/api/commonAPICall";
import toastDisplay from "@/utils/common/toast";
import { Mixpanel } from "@/utils/mixpanel";
import { Center, Spinner, Stack, Box, Badge, Button, HStack } from "@chakra-ui/react";
import { push } from "mixpanel-browser";
import { use, useEffect, useState } from "react";

export default function ExpertList() {
    const [loadingExperts, setLoadingExperts] = useState(false)
    const [experts, setExperts] = useState([])

    async function changeValueInExperts(expertId: any, value: any, newValue: any) {
        let expertsF: any;
        expertsF = experts;
        for (let i = 0; i < experts.length; i++) {
            if (expertsF[i].id && expertsF[i].id === expertId) {
                expertsF[i][value] = newValue
            }
        }
        setExperts(expertsF)
    }

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
        setLoadingExperts(false)
    }

    async function createExpertChannel(expertId: any) {
        await changeValueInExperts(expertId, "isLoading", true)

        Mixpanel.track("On Expert page clicked on create");
        await POSTApiCall('/api/integrations/slack/createExpertChannel', {
            expertId: expertId
        }).then(async (result) => {
            if (result.success) {
                toastDisplay("Expert installed successfully", true)
                await changeValueInExperts(expertId, "isInstalled", true)
            } else {
                toastDisplay("Error while installing expert", false)
            }
        }).catch((error) => {
            toastDisplay("Error in creating expert", false)
            console.log(error)
        })

        await changeValueInExperts(expertId, "isLoading", false)
    }

    async function deleteExpertChannel(expertId: any) {
        await POSTApiCall('/api/integrations/slack/deleteExpertChannel', {
            expertId: expertId
        }).then((result) => {
            if (result.success) {
                toastDisplay("Expert removed successfully", true)
                let expertsF: any;
                for (let i = 0; i < experts.length; i++) {
                    if (expertsF[i].id === expertId) {
                        expertsF[i].isInstalled = false
                    }
                }
                setExperts(expertsF)
            } else {
                toastDisplay("Error while removing expert", false)
            }
            console.log(result)
        }).catch((error) => {
            toastDisplay("Error in creating expert", false)
            console.log(error)
        })
    }

    useEffect(() => {
        getExperts()
    }, []);

    function boxWithBadge(title: string, description: string, onClickFunction: any, onClickFunctionUninstalled: any, expert: any) {
        return (
            expert.id === "" || expert.id === undefined ? <></> :
                <Box disabled={expert.isLoading} as='button' maxW='350px' borderWidth='1px' borderRadius='lg' value={expert.id} onClick={expert.isInstalled ? onClickFunctionUninstalled : onClickFunction}>
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
                                    colorScheme={expert.isInstalled ? "red" : "purple"}
                                    value={expert.id}
                                    isLoading={expert.isLoading}
                                // isDisabled={experName === '' || expertDescription === '' || creatorName === '' || creatorURL === '' || creatorKnowledge === ''}
                                // onClick={() => createExpert()}
                                // onClick={() => router.push('/insights')}
                                >
                                    {expert.isInstalled ? "Uninstall" : "Install"}
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
                                (e: any) => { deleteExpertChannel(e.target.value) },
                                expert)
                        ))}
                    </HStack>
                )}
            </Center>
        </>
    )
}