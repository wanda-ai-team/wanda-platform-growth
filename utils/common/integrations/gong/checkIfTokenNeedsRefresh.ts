import getDBEntry from "@/utils/api/db/getDBEntry";

async function checkIfTokenNeedsRefresh(email: string) {
    const user = await getDBEntry("users", ["email"], ["=="], [email], 1);
    const gongTokenExpiration = user[0].data.gongTokenExpiration;
    console.log("gongTokenExpiration: " + gongTokenExpiration);
    if((new Date().getTime() / 1000) >= gongTokenExpiration || gongTokenExpiration === undefined) {
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