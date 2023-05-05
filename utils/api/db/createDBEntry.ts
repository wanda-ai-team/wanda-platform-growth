import db from "./index.js";

async function createDBEntry(
  collection: any,
  bodyN: any,
) {
  const success = await db.collection(collection).add(
    bodyN
  );

  return success;
}

export default createDBEntry;
