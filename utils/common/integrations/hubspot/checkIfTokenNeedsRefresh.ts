import getDBEntry from "@/utils/api/db/getDBEntry";

async function checkIfTokenNeedsRefresh(email: string) {
    const user = await getDBEntry("users", ["email"], ["=="], [email], 1);
    const hubspotTokenExpiration = user[0].data.hubspotTokenExpiration;
    if((new Date().getTime() / 1000) >= hubspotTokenExpiration || hubspotTokenExpiration === undefined) {
        console.log("token needs refresh");
        return true;
    }
    else {
        return false;
    }
}


export {
    checkIfTokenNeedsRefresh
}