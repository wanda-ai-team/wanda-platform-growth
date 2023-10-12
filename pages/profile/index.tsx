export default function Profile() {
    const client_id = "oty4etue"
    const redirect_uri = "http://localhost:3000/auth/gong"
    const gongURL = "https://app.gong.io/oauth2/authorize?client_id=" + client_id + "&response_type=code&scope=api:calls:create%20api:calls:read:basic&redirect_uri=" + redirect_uri + "&state=296bc9a0-a2a2-4a57"

    return (
        <>
            <a href={gongURL}><button> ola </button></a>
        </>
    )
}

Profile.auth = true;