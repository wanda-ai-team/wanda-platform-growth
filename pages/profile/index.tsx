import { Button, Divider, HStack, Spinner, Text, background } from "@chakra-ui/react";
import styles from "@/styles/HomeN.module.css";
import { useEffect, useState } from "react";

export default function Profile() {
    const [userLoadingGong, setUserLoadingGong] = useState(true);
    const [gongUser, setGongUser] = useState("");
    const [slackBot, setSlackBot] = useState("");
    const client_id = process.env.NEXT_PUBLIC_GONG_ID
    const redirect_uri = process.env.NEXT_PUBLIC_URL + "/auth/gong"
    const gongURL = "https://app.gong.io/oauth2/authorize?client_id=" + client_id + "&response_type=code&scope=api:calls:create%20api:calls:read:basic&redirect_uri=" + redirect_uri + "&state=296bc9a0-a2a2-4a57"

    const slack_client_id = "4964233382976.6071462192929"
    const slack_redirect_uri = process.env.NEXT_PUBLIC_URLS + "/auth/slack"
    const slackBotURL = "https://slack.com/oauth/v2/authorize?client_id=4964233382976.6071462192929&scope=channels:join,channels:manage,channels:read,chat:write,commands,groups:read,im:read,mpim:read,users:read&user_scope="+ "&redirect_uri=" + slack_redirect_uri
    // const slackBotURL = "https://slack.com/oauth/v2/authorize?scope=channels:manage,chat:write,users:read&user_scope=&client_id=" + slack_client_id 

    async function getUser() {
        // if (session && session.data && session.data.user.isActive === false) {
        await fetch('/api/user/getSpecificUserInfo', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                info: ["gongAccessToken", "slackAccessToken"],
            }),
        })
            .then((res) => res.json())
            .then(async (data1) => {
                if (data1.success) {
                    console.log(data1)
                    setGongUser(data1.content[0].gongAccessToken)
                    setSlackBot(data1.content[0].slackAccessToken)
                    console.log(data1)
                }
            })

        setUserLoadingGong(false);
    }

    async function disconnectGong() {
        await fetch('/api/user/deleteSpecificUserInfo', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                info: ["gongAccessToken", "gongRefreshToken"],
            }),
        })
        setGongUser("")

    }

    useEffect(() => {
        getUser();
    }, []);

    return (
        <main className={styles.main}>
            <div className={styles.form__container} style={{ backgroundColor: 'white' }}>
                <div className={styles.title__container}>
                    <Text as="h2" fontSize="3xl">
                        Profile Settings
                    </Text>
                </div>
                <div className={styles.form__container} style={{ backgroundColor: 'white' }}>
                    <Text as="h2" fontSize="2xl">
                        Gong
                    </Text>
                    {!userLoadingGong ?
                        <>
                            <Text as="h2" fontSize="m">
                                {gongUser !== "" ? "Connected " + gongUser : "Not Connected"}
                            </Text>
                            <HStack>
                                <a href={gongURL}>
                                    <Button colorScheme="purple" >
                                        {gongUser !== "" ? "Reconnect" : "Connect"} to Gong
                                    </Button>
                                </a>
                                {gongUser !== "" &&
                                    <Button colorScheme="red" onClick={disconnectGong} >
                                        Disconnect from Gong
                                    </Button>
                                }
                            </HStack>
                        </>
                        :
                        <>
                            <Spinner
                                thickness='4px'
                                speed='0.65s'
                                emptyColor='gray.200'
                                color='blue.500'
                                size='xl' />
                        </>
                    }
                    <Divider orientation="horizontal" />

                    <Text as="h2" fontSize="2xl">
                        Slack Bot
                    </Text>
                    <Text as="h2" fontSize="m">
                        {slackBot !== "" ? "Connected " + slackBot : "Not Connected"}
                    </Text>
                    <a href={slackBotURL}>
                        <Button colorScheme="purple" >
                            <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "20px", width: "20px", marginRight: "12px" }} viewBox="0 0 122.8 122.8"><path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a"></path><path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0"></path><path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d"></path><path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e"></path></svg>
                            {slackBot !== "" ? "Reconnect" : "Add"} bot to Slack
                        </Button>
                    </a>
                </div>
            </div>
        </main>
    )
}

Profile.auth = true;