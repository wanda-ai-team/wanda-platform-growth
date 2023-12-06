import { POSTApiCall } from "@/utils/api/commonAPICall";
import toastDisplay from "@/utils/common/toast";
import { Mixpanel } from "@/utils/mixpanel";
import { PhoneIcon, CheckIcon, LinkIcon } from "@chakra-ui/icons";
import { Center, Spinner, Stack, Box, Badge, Input, InputGroup, InputLeftElement, InputRightElement, Button, Textarea } from "@chakra-ui/react";
import { push } from "mixpanel-browser";
import { useState } from "react";

export default function ExpertCreation() {
    const [loadingCreation, setLoadingCreation] = useState(false)
    const [experName, setExpertName] = useState('')
    const [expertDescription, setExpertDescription] = useState('')
    const [creatorName, setCreatorName] = useState('')
    const [creatorURL, setCreatorURL] = useState('')
    const [creatorKnowledge, setCreatorKnowledge] = useState('')
    const [file, setFile] = useState('')

    async function createExpert() {
        setLoadingCreation(true)
        Mixpanel.track("On Expert page clicked on create");
        await POSTApiCall('/api/expert/createExpert', {
            "expertName": experName,
            "expertDescription": expertDescription,
            "creatorName": creatorName,
            "creatorURL": creatorURL,
            "creatorKnowledge": creatorKnowledge,
            "file": file
        }).then((result) => {
            toastDisplay("Expert created successfully", true)
            console.log(result)
        }).catch((error) => {
            toastDisplay("Error in creating expert", false)
            console.log(error)
        })
        setLoadingCreation(false)
    }

    function inputWithIcon(value: any, onChangeFunction: any, placeholder: any, icon: any, isDisabled?: boolean) {
        return (
            <InputGroup>
                <InputLeftElement pointerEvents='none'>
                    {icon}
                </InputLeftElement>
                <Input isDisabled={isDisabled} type='text' value={value} onChange={onChangeFunction} placeholder={placeholder} />
            </InputGroup>
        )
    }

    return (
        <>
            <Center marginTop={"56px"}>
                <Stack spacing={4} w={"50vw"}>

                    {inputWithIcon(experName, (e: any) => setExpertName(e.target.value), 'Expert Name', <PhoneIcon color='gray.300' />, loadingCreation)}

                    <Textarea isDisabled={loadingCreation} placeholder="Description of the expert" value={expertDescription} onChange={(e) => setExpertDescription(e.target.value)} />

                    {inputWithIcon(creatorName, (e: any) => setCreatorName(e.target.value), 'Creator Name', <PhoneIcon color='gray.300' />, loadingCreation)}

                    {inputWithIcon(creatorURL, (e: any) => setCreatorURL(e.target.value), 'Creator URL', <LinkIcon color='gray.300' />, loadingCreation)}

                    <Textarea isDisabled={loadingCreation} placeholder="Creator knowledge" value={creatorKnowledge} onChange={(e) => setCreatorKnowledge(e.target.value)} />

                    <Input
                        placeholder="Select Date and Time"
                        size="md"
                        type="file"
                        onChange={(e) => setFile(e.target.value)}
                        value={file}
                    />
                    <Button
                        isLoading={loadingCreation}
                        size='sm'
                        colorScheme="purple"
                        isDisabled={experName === '' || expertDescription === '' || creatorName === '' || creatorURL === '' || creatorKnowledge === ''}
                        onClick={() => createExpert()}
                    // onClick={() => router.push('/insights')}
                    >
                        Create
                    </Button>
                </Stack>
            </Center>
        </>
    )
}