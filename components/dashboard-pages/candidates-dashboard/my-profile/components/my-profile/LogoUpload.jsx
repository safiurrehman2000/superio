"use client";

import Image from "next/image";
import { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const LogoUpload = () => {
  const [logoImg, setLogoImg] = useState(null);
  const [preview, setPreview] = useState("");

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
    setLogoImg(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setLogoImg(null);
    setPreview("");
    // Reset input field
    const input = document.getElementById("upload");
    if (input) input.value = "";
  };

  return (
    <div className="uploading-outer" style={{ gap: "10px" }}>
      {!preview ? (
        <div className="uploadButton">
          <input
            className="uploadButton-input"
            type="file"
            name="attachments[]"
            accept="image/jpeg,image/png"
            id="upload"
            onChange={logoImgHandler}
          />
          <label className="uploadButton-button ripple-effect" htmlFor="upload">
            Browse Logo
          </label>
        </div>
      ) : (
        <div style={{ width: "150px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Image
              src={preview}
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
                onClick={() => document.getElementById("upload").click()}
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
            id="upload"
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

export default LogoUpload;
