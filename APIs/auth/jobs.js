import { db } from "@/utils/firebase";
import { errorToast, successToast } from "@/utils/toast";
import { addDoc, collection } from "firebase/firestore";

export const useCreateJobPost = async (payload) => {
  try {
    await addDoc(collection(db, "jobs"), payload);
    successToast("Job Created Successfully");
    return { success: true };
  } catch (error) {
    console.log("error :>> ", error);
    errorToast("Couldn't create job post");
    return { success: false };
  }
};
