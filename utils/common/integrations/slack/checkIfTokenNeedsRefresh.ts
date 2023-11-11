import getDBEntry from "@/utils/api/db/getDBEntry";

async function checkIfTokenNeedsRefresh(email: string) {
    const user = await getDBEntry("users", ["email"], ["=="], [email], 1);
    const slackTokenexpiration = user[0].data.slackTokenexpiration;
    if((new Date().getTime() / 1000) >= slackTokenexpiration) {
        return true;
    }
    else {
        return false;
    }
}


export {
    checkIfTokenNeedsRefresh
}