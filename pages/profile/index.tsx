import { Button, Divider, Text, background } from "@chakra-ui/react";
import styles from "@/styles/HomeN.module.css";
import { useEffect, useState } from "react";

export default function Profile() {
    const [gongUser, setGongUser] = useState("");
    const [slackBot, setSlackBot] = useState("");
    const client_id = "oty4etue"
    const redirect_uri = process.env.NEXT_PUBLIC_URL + "/auth/gong"
    const gongURL = "https://app.gong.io/oauth2/authorize?client_id=" + client_id + "&response_type=code&scope=api:calls:create%20api:calls:read:basic&redirect_uri=" + redirect_uri + "&state=296bc9a0-a2a2-4a57"

    const slack_client_id = "4964233382976.6053595309088"
    const slack_redirect_uri = process.env.NEXT_PUBLIC_URL + "/auth/slack"
    const slackBotURL = "https://slack.com/oauth/v2/authorize?scope=incoming-webhook,commands&client_id=" + slack_client_id + "&redirect_uri=" + slack_redirect_uri

    async function getUser() {
        // if (session && session.data && session.data.user.isActive === false) {
        await fetch('/api/user/getSpecificUserInfo', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                info: "gongAccessToken",
            }),
        })
            .then((res) => res.json())
            .then(async (data1) => {
                if (data1.success) {
                    setGongUser(data1.content)
                    console.log(data1)
                }
            })

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
                    <Text as="h2" fontSize="m">
                        {gongUser !== "" ? "Connected " + gongUser : "Not Connected"}
                    </Text>
                    <a href={gongURL}>
                        <Button colorScheme="purple" >
                            {gongUser !== "" ? "Reconnect" : "Connect"} to Gong
                        </Button>
                    </a>

                    <Divider orientation="horizontal" />

                    {/* <Text as="h2" fontSize="2xl">
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
                    </a> */}
                </div>
            </div>
        </main>
    )
}

Profile.auth = true;