import getDBEntry from "@/utils/api/db/getDBEntry";
import updateDBEntry from "@/utils/api/db/updateDBEntry";
import { Client } from "@hubspot/api-client";

const GRANT_TYPES = {
    AUTHORIZATION_CODE: 'authorization_code',
    REFRESH_TOKEN: 'refresh_token',
};

async function refreshToken(email: string) {
    const user = await getDBEntry("users", ["email"], ["=="], [email], 1);
    const refreshToken = user[0].data.hubspotRefreshToken;

    console.log("refreshToken: " + refreshToken);

    const hubspotClient = new Client();
    const result = await hubspotClient.oauth.tokensApi.create(
        GRANT_TYPES.REFRESH_TOKEN,
        undefined,
        undefined,
        process.env.HUBSPOT_CLIENT_ID,
        process.env.HUBSPOT_CLIENT_SECRET,
        refreshToken
    ).then(async (data) => {
        console.log("refreshed token")
        console.log(data);
        if (data.accessToken !== undefined && data.refreshToken !== undefined && data.expiresIn !== undefined) {
            const currentSeconds = (new Date().getTime() / 1000) + data.expiresIn;
            await updateDBEntry("users", { hubspotAccessToken: data.accessToken, hubspotRefreshToken: data.refreshToken, hubspotTokenExpiration: currentSeconds }, ['email'], '==', [email], 1);
            return data;
        }
        return null
    });
    return result;
}


export {
    refreshToken
}