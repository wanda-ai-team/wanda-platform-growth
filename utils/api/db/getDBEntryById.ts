import db from "./index.js";

async function getDBEntryById(
  collection: any,
  entyId: any,
) {
  let response;
  response = (await db.doc( collection + "/" + entyId).get()).data();

  return response;

}

export default getDBEntryById;
