import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Box, Center, Spinner, Text, Button, Stack, Spacer } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import styles from "@/styles/HomeN.module.css";
import { Mixpanel } from '@/utils/mixpanel';

export default function Home() {
    const [loading, setLoading] = useState<boolean>(true);
    const session = useSession({ required: true })
    const { push } = useRouter();

    async function getUser() {
        // if (session && session.data && session.data.user.isActive === false) {
        await fetch('/api/user/getUser')
            .then((res) => res.json())
            .then(async (data1) => {
                if (data1.content[0].data.context) {
                } else {
                    push('/onboarding');
                }
                setLoading(false);
            }).catch((err) => {
                setLoading(false);
            });

    }

    useEffect(() => {
        getUser();
    }, []);


    return (
        <Center h='80vh'>
            {loading ? (
                <Spinner
                    thickness='4px'
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='blue.500'
                    size='xl' />
            )
                :
                <Stack direction='row' spacing={8}>
                    <Box as='button' maxW='350px' borderWidth='1px' borderRadius='lg' onClick={() => { Mixpanel.track("On Dashboard clicked on insights"); push('/insights') }}>

                        <Box p='6' alignItems='center'>
                            <Stack direction='column' spacing={8}>
                                <Badge borderRadius='full' colorScheme='purple'>
                                    <Box alignItems='center' as='span' fontSize='20px'>
                                        Customer Call Insights
                                    </Box>
                                </Badge>
                                <Box>
                                    <Box as='span' color='gray.600' fontSize='sm'>
                                        Take your client calls to the next level. Wanda will get you the insights you need and help you align accross Slack.
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>
                    </Box>

                    <Box as='button' maxW='350px' borderWidth='1px' borderRadius='lg' onClick={() => { Mixpanel.track("On Dashboard clicked on repurpose"); push('/repurpose') }}>
                        <Box p='6' alignItems='center'>
                            <Stack direction='column' spacing={8}>
                                <Badge borderRadius='full' colorScheme='purple'>
                                    <Box alignItems='center' as='span' fontSize='20px'>
                                        Repurpose Content
                                    </Box>
                                </Badge>
                                <Box>
                                    <Box as='span' color='gray.600' fontSize='sm'>
                                        Take your already created content and scale it, Wanda will help you repurpose your content and get it in front of the right people.
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>
                    </Box>
                </Stack>
            }
        </Center >
    );
};

Home.auth = true;