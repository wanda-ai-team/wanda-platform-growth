import db from "./index.js";

async function deleteDBEntry(
  collection: any,
  condition: any[],
  conditionOperation: any[],
  conditionValue: any[],
  numberOfConditions: number
) {
  let collectionValue;
  collectionValue = db.collection(collection);

  for (let i = 0; i < numberOfConditions; i++) {
    collectionValue = collectionValue.where(
      condition[i],
      conditionOperation[i],
      conditionValue[i]
    );
  }

  const coll = await collectionValue.get()
    .catch(function (error: any) {
      console.log("Error getting documents: ", error);
      return [];
    });

    coll.forEach(async function (doc: { id: any; }) {
      await db.collection(collection).doc(doc.id).delete();
    });
    return true;
}

export default deleteDBEntry;
