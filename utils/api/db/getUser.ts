import { userCollection } from "@/utils/globalVariables.js";
import db from "./index.js";

async function getUser(condition: string | FirebaseFirestore.FieldPath, conditionOperation: any, conditionValue: any) {
  const userN = await db
    .collection(userCollection)
    .where(condition, conditionOperation, conditionValue)
    .get();

  if (userN.docs.length === 0) {
    return null;
  }

  const data = userN.docs[0].data();

  return data;
}

export { getUser };