import { db } from "@/utils/firebase";
import { doc, setDoc } from "firebase/firestore";

export const useUpdateIsFirstTime = async (id) => {
  try {
    await setDoc(doc(db, "users", id), { isFirstTime: false }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
};
