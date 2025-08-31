"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const RichTextArea = ({
  label,
  name,
  placeholder,
  required = false,
  minLength,
  maxLength,
  defaultValue = "",
  disabled = false,
  onChange,
  value,
  className = "",
}) => {
  const [editorValue, setEditorValue] = useState(defaultValue || "");

  // Quill modules to attach to editor
  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };

  // Quill editor formats
  const formats = [
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "link",
  ];

  useEffect(() => {
    if (value !== undefined) {
      setEditorValue(value);
    }
  }, [value]);

  const handleChange = (content, delta, source, editor) => {
    const text = editor.getText(); // Get plain text for validation
    setEditorValue(content);

    if (onChange) {
      onChange({
        target: {
          name,
          value: content,
          textContent: text,
        },
      });
    }
  };

  const validateContent = () => {
    if (required && !editorValue.trim()) {
      return `${label || "This field"} is required!`;
    }

    if (minLength && editorValue.length < minLength) {
      return `${
        label || "This field"
      } must be at least ${minLength} characters long.`;
    }

    if (maxLength && editorValue.length > maxLength) {
      return `${
        label || "This field"
      } must not exceed ${maxLength} characters.`;
    }

    return null;
  };

  const error = validateContent();

  return (
    <div className="form-group">
      {label && (
        <label style={{ display: "flex", alignItems: "center" }}>
          {label}
          {required ? (
            <p style={{ color: "#FA5508", margin: 0 }}>*</p>
          ) : (
            <p></p>
          )}
        </label>
      )}

      <div className={`rich-text-editor ${className}`}>
        <ReactQuill
          theme="snow"
          value={editorValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
        />
      </div>

      {error && (
        <p className="text-danger mt-2" style={{ fontSize: "0.875rem" }}>
          {error}
        </p>
      )}

      {/* Character count */}
      {(minLength || maxLength) && (
        <small className="text-muted mt-1 d-block">
          {editorValue.length} characters
          {maxLength && ` / ${maxLength} max`}
        </small>
      )}
    </div>
  );
};

export default RichTextArea;
