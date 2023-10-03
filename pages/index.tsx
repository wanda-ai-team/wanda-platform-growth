import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Spinner } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';

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
                    push('/dashboard');
                } else {
                    push('/onboarding');
                }
                setLoading(false);
            }).catch((err) => {
                push('/dashboard');
                setLoading(false);
            });

    }

    useEffect(() => {
        getUser();
    }, []);


    return (
        <Center h='80vh'>
            {loading && (
                <Spinner
                    thickness='4px'
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='blue.500'
                    size='xl' />
            )}
        </Center>
    );
};

Home.auth = true;