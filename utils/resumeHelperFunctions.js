export const checkFileTypes = (files) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  return Array.from(files).every((file) => allowedTypes.includes(file.type));
};

export const checkFileSize = (files) => {
  const maxSize = 500 * 1024; // 500 KB in bytes
  return Array.from(files).every((file) => file.size <= maxSize);
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]); // Extract base64 data
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const resumeToFile = (resume) => {
  const byteString = atob(resume.fileData);
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }
  return new File([byteArray], resume.fileName, { type: resume.fileType });
};
