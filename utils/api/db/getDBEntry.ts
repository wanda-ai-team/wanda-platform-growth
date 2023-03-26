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
  return await collectionValue
    .get()
    .then(async function (querySnapshot: any[]) {
      querySnapshot.forEach(async function (doc: { id: any; data: () => any; }) {
        response.push({ id: doc.id, data: doc.data() });
      });
      return response;
    })
    .catch(function (error: any) {
      console.log("Error getting documents: ", error);
      return [];
    });

}

export default getDBEntry;
