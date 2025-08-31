"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { sanitizeRichText } from "@/utils/sanitization";
import "react-quill/dist/quill.snow.css";

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
    const sanitizedContent = sanitizeRichText(content); // Sanitize the HTML content
    setEditorValue(sanitizedContent);

    if (onChange) {
      onChange({
        target: {
          name,
          value: sanitizedContent,
          textContent: text,
        },
      });
    }
  };

  const validateContent = () => {
    // Get plain text length for validation (without HTML tags)
    const plainText = editorValue.replace(/<[^>]*>/g, "").trim();

    if (required && !plainText) {
      return `${label || "This field"} is required!`;
    }

    if (minLength && plainText.length < minLength) {
      return `${
        label || "This field"
      } must be at least ${minLength} characters long.`;
    }

    if (maxLength && plainText.length > maxLength) {
      return `${
        label || "This field"
      } must not exceed ${maxLength} characters.`;
    }

    return null;
  };

  const error = validateContent();

  // Get plain text length for character count
  const plainTextLength = editorValue.replace(/<[^>]*>/g, "").length;

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
          {plainTextLength} characters
          {maxLength && ` / ${maxLength} max`}
        </small>
      )}

      <style jsx global>{`
        .rich-text-editor {
          margin-bottom: 1rem;
        }

        .rich-text-editor .ql-container {
          min-height: 120px;
          font-size: 14px;
          border: 1px solid #ced4da;
          border-top: none;
        }

        .rich-text-editor .ql-editor {
          min-height: 100px;
          padding: 12px 15px;
          font-size: 14px;
          line-height: 1.5;
        }

        .rich-text-editor .ql-toolbar {
          border: 1px solid #ced4da;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          background-color: #f8f9fa;
          padding: 8px;
        }

        .rich-text-editor .ql-container {
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
        }

        .rich-text-editor .ql-editor.ql-blank::before {
          color: #6c757d;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default RichTextArea;
