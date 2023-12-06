import { Mixpanel } from "@/utils/mixpanel";
import { Center, Spinner, Stack, Box, Badge } from "@chakra-ui/react";
import { push } from "mixpanel-browser";
import { useRouter } from "next/router";

export default function Expert() {
    const { push } = useRouter();

    return (
        <Center h='80vh'>
            <Stack direction='row' spacing={8}>
                <Box as='button' maxW='350px' borderWidth='1px' borderRadius='lg' onClick={() => { Mixpanel.track("On Expert page clicked on create"); push('/expert/create') }}>
                    <Box p='6' alignItems='center'>
                        <Stack direction='column' spacing={8}>
                            <Badge borderRadius='full' colorScheme='purple'>
                                <Box alignItems='center' as='span' fontSize='20px'>
                                    Expert Creation
                                </Box>
                            </Badge>
                            <Box>
                                <Box as='span' color='gray.600' fontSize='sm'>
                                    Create a new expert character and give your knowledge a voice.
                                </Box>
                            </Box>
                        </Stack>
                    </Box>
                </Box>

                <Box as='button' maxW='350px' borderWidth='1px' borderRadius='lg' onClick={() => { Mixpanel.track("On Expert page clicked on list"); push('/expert/list') }}>
                    <Box p='6' alignItems='center'>
                        <Stack direction='column' spacing={8}>
                            <Badge borderRadius='full' colorScheme='purple'>
                                <Box alignItems='center' as='span' fontSize='20px'>
                                    Expert List
                                </Box>
                            </Badge>
                            <Box>
                                <Box as='span' color='gray.600' fontSize='sm'>
                                    Check out the list of experts and add them to your Slack.
                                </Box>
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </Stack>
        </Center >
    )
}