import db from "./index.js";

async function updateDBEntry(
  collection: any,
  bodyN: any,
) {
  const success = await db.collection(collection).add(
    bodyN
  );

  return success;
}

export default updateDBEntry;
