import getDBEntry from "@/utils/api/db/getDBEntry";
import updateDBEntry from "@/utils/api/db/updateDBEntry";

async function refreshToken(email: string) {
    console.log("Refreshing token");
    console.log(email);
    const user = await getDBEntry("users", ["email"], ["=="], [email], 1);
    const refreshToken = user[0].data.gongRefreshToken;

    const URL = "https://app.gong.io/oauth2/generate-customer-token" +
        "?grant_type=refresh_token" +
        "&refresh_token=" + refreshToken;

    let data = process.env.GONG_ID + ":" + process.env.GONG_SECRET;
    let buff = new Buffer(data);
    let base64data = buff.toString('base64');

    // Set the headers for the request, including the API token and content type
    const headers = {
        authorization: "Basic " + base64data,
        "content-type": "application/json",
    };

    // Send a POST request to the transcription API with the audio URL in the request body
    const response = await fetch(URL, {
        method: "POST",
        headers,
    }).then((response) => response.json())
        .then(async (data) => {
            const currentSeconds = (new Date().getTime() / 1000) + data.expires_in;
            await updateDBEntry("users", { gongAccessToken: data.access_token, gongRefreshToken: data.refresh_token, expiration: currentSeconds }, ['email'], ['=='], [email], 1);
            return data;
        });
    return response;
}


export {
    refreshToken
}