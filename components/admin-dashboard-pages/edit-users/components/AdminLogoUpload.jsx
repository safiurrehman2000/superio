"use client";

import { fileToBase64 } from "@/utils/resumeHelperFunctions";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const AdminLogoUpload = () => {
  const { setValue, watch } = useFormContext();
  const logo = watch("logo");
  const [preview, setPreview] = useState("");

  // Update preview when logo changes
  useEffect(() => {
    if (logo) {
      // If logo is already a data URL, use it directly
      if (logo.startsWith("data:image")) {
        setPreview(logo);
      } else {
        // If it's a base64 string, add the data URL prefix
        setPreview(`data:image/jpeg;base64,${logo}`);
      }
    } else {
      setPreview("");
    }
  }, [logo]);

  const logoSrc = preview
    ? preview.startsWith("data:image")
      ? preview
      : `data:image/jpeg;base64,${preview}`
    : "https://via.placeholder.com/150x150?text=No+Logo";

  const validateImage = (file) => {
    const allowedFileTypes = ["image/jpeg", "image/png"];
    const maxFileSize = 1 * 1024 * 1024; // 1MB

    if (!file) {
      alert("No file selected. Please choose a file to upload.");
      return false;
    }

    if (!allowedFileTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a JPG or PNG file.");
      return false;
    }

    if (file.size > maxFileSize) {
      alert("File size exceeds the maximum limit of 1MB.");
      return false;
    }

    return true;
  };

  const logoImgHandler = async (e) => {
    const file = e.target.files[0];

    // Validate file
    if (!validateImage(file)) {
      return;
    }

    // If all validations pass
    const convertedFile = await fileToBase64(file);
    setValue("logo", convertedFile, { shouldValidate: true });
    // For preview, we need the full data URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setValue("logo", null, { shouldValidate: true });
    setPreview("");
    // Reset input field
    const input = document.getElementById("admin-upload");
    if (input) input.value = "";
  };

  // Clean up preview URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="uploading-outer" style={{ gap: "10px" }}>
      {!preview ? (
        <div className="uploadButton">
          <input
            className="uploadButton-input"
            type="file"
            name="attachments[]"
            accept="image/jpeg,image/png"
            id="admin-upload"
            onChange={logoImgHandler}
          />
          <label
            className="uploadButton-button ripple-effect"
            htmlFor="admin-upload"
          >
            Browse Logo/Image
          </label>
        </div>
      ) : (
        <div style={{ width: "150px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Image
              src={logoSrc}
              alt="Logo preview"
              width={150}
              height={150}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                height: "150px",
                width: "150px",
              }}
              onLoad={() => URL.revokeObjectURL(preview)}
            />
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                type="button"
                onClick={() => document.getElementById("admin-upload").click()}
                title="Edit"
              >
                <FiEdit2 color="#FA5508" size={15} />
              </button>
              <button onClick={removeImage} title="Remove">
                <FiTrash2 color="#FA5508" size={15} />
              </button>
            </div>
          </div>
          <input
            style={{ display: "none" }}
            type="file"
            name="attachments[]"
            accept="image/jpeg,image/png"
            id="admin-upload"
            onChange={logoImgHandler}
          />
        </div>
      )}
      <div className="text">
        Max file size is 1MB, Minimum dimension: 330x300. Suitable files are
        .jpg & .png
      </div>
    </div>
  );
};

export default AdminLogoUpload;
