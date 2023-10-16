import getDBEntry from "@/utils/api/db/getDBEntry";

async function checkIfTokenNeedsRefresh(email: string) {
    const user = await getDBEntry("users", ["email"], ["=="], [email], 1);
    const expiration = user[0].data.expiration;
    if((new Date().getTime() / 1000) >= expiration) {
        return true;
    }
    else {
        return false;
    }
}


export {
    checkIfTokenNeedsRefresh
}