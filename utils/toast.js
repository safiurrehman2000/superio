import toast from "react-hot-toast";

let errorToastId;
export const successToast = (message) =>
  toast.success(message, {
    duration: 4000,
    position: "top-center",
  });
export const errorToast = (message) => {
  if (errorToastId) {
    toast.dismiss(errorToastId); // Dismiss the existing error toast
  }
  errorToastId = toast.error(message, {
    duration: 4000,
    position: "top-center",
    id: "error-toast",
  });
};
