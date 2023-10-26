import db from "./index.js";

async function updateDBEntry(
  collection: any,
  bodyN: any,
  entyId: any,
) {
  let collectionValue;
  collectionValue = db.doc(collection + "/" + entyId);

  const success = await db.collection(collection).doc(entyId)
    .update({
      ...bodyN,
      updated: new Date().toISOString(),
    });

  return success;
}

export default updateDBEntry;