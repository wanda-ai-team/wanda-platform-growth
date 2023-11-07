import db from "./index.js";

async function getDBEntry(
  collection: any,
  condition: any[],
  conditionOperation: any[],
  conditionValue: any[],
  numberOfConditions: number
) {
  let collectionValue;
  collectionValue = db.collection(collection);
  let response = <any>[];

  for (let i = 0; i < numberOfConditions; i++) {
    collectionValue = collectionValue.where(
      condition[i],
      conditionOperation[i],
      conditionValue[i]
    );
  }
  const coll = await collectionValue.get().catch(function (error: any) {
    console.log("Error getting documents: ", error);
    return [];
  });


  coll.forEach(async function (doc: { id: any; data: () => any; }) {
    console.log(doc.id, " => ", doc.data());
    response.push({ id: doc.id, data: doc.data() });
  });

  return response;

}

export default getDBEntry;
