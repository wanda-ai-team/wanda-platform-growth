import { userCollection } from "../../globalVariables";
import db from "./index.js";

async function updateUserInfo(
  bodyN: any,
  condition: any,
  conditionOperation: any,
  conditionValue: any
) {
  await db
    .collection(userCollection)
    .where(condition, conditionOperation, conditionValue)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(async function (doc) {
        // doc.data() is never undefined for query doc snapshots

        await db
          .collection(userCollection)
          .doc(doc.id)
          .update({
            ...bodyN,
            updated: new Date().toISOString(),
          });
      });
    })
    .catch(function (error) {
      console.log("Error getting documents: ", error);
    });
}

export { updateUserInfo };