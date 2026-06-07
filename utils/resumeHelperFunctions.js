export const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".docx"];
export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const ALLOWED_RESUME_ACCEPT =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const ALLOWED_RESUME_LABEL = ".pdf and .docx";

const getFileExtension = (fileName = "") => {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot).toLowerCase();
};

export const getResumeMimeType = (resume) => {
  if (resume?.fileType && ALLOWED_RESUME_MIME_TYPES.includes(resume.fileType)) {
    return resume.fileType;
  }
  const ext = getFileExtension(resume?.fileName || "");
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "application/octet-stream";
};

export const isPdfResume = (resume) =>
  getResumeMimeType(resume) === "application/pdf";

export const isAllowedResumeFile = (file) => {
  if (!(file instanceof File)) return false;
  const ext = getFileExtension(file.name);
  if (!ALLOWED_RESUME_EXTENSIONS.includes(ext)) return false;
  if (!file.type || file.type === "application/octet-stream") return true;
  return ALLOWED_RESUME_MIME_TYPES.includes(file.type);
};

export const checkFileTypes = (files) => {
  return Array.from(files).every((file) => isAllowedResumeFile(file));
};

export const checkFileSize = (files) => {
  const maxSize = 500 * 1024;
  return Array.from(files).every((file) => file.size <= maxSize);
};

export const truncateFileName = (fileName, maxLength = 28) => {
  if (!fileName || fileName.length <= maxLength) return fileName || "";
  const ext = getFileExtension(fileName);
  const base = fileName.slice(0, fileName.length - ext.length);
  const keep = maxLength - ext.length - 3;
  if (keep <= 0) return `...${ext}`;
  return `${base.slice(0, keep)}...${ext}`;
};

export const fileToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
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
  return new File([byteArray], resume.fileName, {
    type: getResumeMimeType(resume),
  });
};

export const createResumeObjectUrl = (resume) => {
  if (!resume?.fileData) return null;
  const file = resumeToFile(resume);
  return URL.createObjectURL(file);
};

export const downloadResume = (resume) => {
  if (!resume?.fileData) return false;
  try {
    const url = createResumeObjectUrl(resume);
    if (!url) return false;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = resume.fileName || "resume";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
};
