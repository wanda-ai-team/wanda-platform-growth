import db from "./index.js";

async function updateDBEntry(
  collection: any,
  bodyN: any,
  condition: any,
  conditionOperation: any,
  conditionValue: any,
  numberOfConditions: any
) {
  let collectionValue;
  collectionValue = db.collection(collection);

  for (let i = 0; i < numberOfConditions; i++) {
    console.log(condition[i], conditionOperation[i], conditionValue[i]);
    collectionValue = collectionValue.where(
      condition[i],
      conditionOperation[i],
      conditionValue[i]
    );
  }

  const success = await collectionValue
    .get()
    .then(async function (querySnapshot) {
      if (querySnapshot.empty) {
        console.log("No matching documents.");

        await db.collection(collection).add(
          bodyN
        );
        return true;
      } else {
        querySnapshot.forEach(async function (doc) {
          console.log(doc.id, " => ", doc.data());
          await db
            .collection(collection)
            .doc(doc.id)
            .update({
              ...bodyN,
              updated: new Date().toISOString(),
            });
        });
        return true;
      }
    })
    .catch(function (error) {
      console.log("Error getting documents: ", error);
      return false;
    });

    return success;
}

export default updateDBEntry;