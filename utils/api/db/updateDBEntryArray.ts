import db from "./index.js";

async function updateDBEntryArray(
  collection: any,
  bodyN: any,
  arrayName: any,
  condition: any,
  conditionOperation: any,
  conditionValue: any,
  numberOfConditions: any
) {
  let collectionValue = db.collection(collection);

  for (let i = 0; i < numberOfConditions; i++) {
    collectionValue.where(
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

          let arrayV = [bodyN]
          if(doc.get(arrayName) !== undefined){
            arrayV = doc.get(arrayName);
            arrayV.push(bodyN);
          }
          let bodyF = {[arrayName]: arrayV}
          await db
            .collection(collection)
            .doc(doc.id)
            .update({
              ...bodyF,
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

export default updateDBEntryArray;