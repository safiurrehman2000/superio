"use client";

import {
  useGetAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
} from "@/APIs/auth/database";
import { deleteUserCompletelyByAdmin } from "@/APIs/auth/admin";
import AutoSelect from "@/components/autoselect/AutoSelect";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { InputField } from "@/components/inputfield/InputField";
import { SelectField } from "@/components/selectfield/SelectField";
import { TextAreaField } from "@/components/textarea/TextArea";
import {
  AGE_OPTIONS,
  GENDERS,
  PROFILE_VISIBILITY_OPTIONS,
} from "@/utils/constants";
import { useStates, useSectors } from "@/utils/hooks/useOptionsFromFirebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import AdminLogoUpload from "./AdminLogoUpload";
import { successToast } from "@/utils/toast";
import Select from "react-select";

const EditUser = () => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { push } = useRouter();
  const {
    data: users,
    loading: usersLoading,
    error: usersError,
  } = useGetAllUsers();

  // Fetch options from Firebase
  const { options: states, loading: statesLoading } = useStates();
  const { options: sectors, loading: sectorsLoading } = useSectors();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      // Common fields
      email: "",

      // Candidate fields
      name: "",
      title: "",
      phone_number: "",
      gender: "",
      age: "",
      profile_visibility: "",
      description: "",

      // Employer fields
      logo: null,
      company_name: "",
      phone: "",
      website: "",
      company_type: [],
      company_location: "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    reset,
    setValue,
    watch,
  } = methods;

  const selectedUser = users.find((user) => user.id === selectedUserId);
  const userType = selectedUser?.userType;

  console.log("selectedUser", selectedUser);

  // Transform users data for react-select
  const userOptions = users.map((user) => ({
    value: user.id,
    label:
      user.userType === "Candidate"
        ? `${user.name || "Unknown"} (Candidate) - ${user.email}`
        : `${user.company_name || "Unknown Company"} (Employer) - ${
            user.email
          }`,
    user: user, // Keep the full user object for reference
  }));

  const handleUserSelection = (selectedOption) => {
    const userId = selectedOption ? selectedOption.value : "";
    setSelectedUserId(userId);
    if (userId) {
      const selectedUser = users.find((user) => user.id === userId);
      if (selectedUser) {
        // Reset form first
        reset();
        // Set common fields
        setValue("email", selectedUser.email || "");
        if (selectedUser.userType === "Candidate") {
          setValue("name", selectedUser.name || "");
          setValue("title", selectedUser.title || "");
          setValue("phone_number", selectedUser.phone_number || "");
          setValue("gender", selectedUser.gender || "");
          setValue("age", selectedUser.age || "");
          setValue("profile_visibility", selectedUser.profile_visibility || "");
          setValue("description", selectedUser.description || "");
        } else if (selectedUser.userType === "Employer") {
          // Parse logo value for preview
          if (selectedUser.logo) {
            setValue(
              "logo",
              selectedUser.logo.startsWith("data:image")
                ? selectedUser.logo
                : `data:image/jpeg;base64,${selectedUser.logo}`
            );
          } else {
            setValue("logo", null);
          }
          setValue("company_name", selectedUser.company_name || "");
          setValue("phone", selectedUser.phone || "");
          setValue("website", selectedUser.website || "");
          setValue("company_type", selectedUser.company_type || []);
          setValue("company_location", selectedUser.company_location || "");
          setValue("description", selectedUser.description || "");
        }
      }
    } else {
      reset();
    }
  };

  const onSubmit = async (data) => {
    if (loading) return;
    if (!selectedUserId) {
      setError("Please select a user to edit");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Form data:", data);
      console.log("Form logo value:", data.logo);

      // Helper function to clean undefined and empty string values for optional fields
      const cleanData = (obj) => {
        const cleaned = {};
        const optionalFields = [
          "title",
          "phone_number",
          "website",
          "company_type",
          "company_location",
          "description",
        ];

        Object.keys(obj).forEach((key) => {
          if (obj[key] !== undefined) {
            if (optionalFields.includes(key) && obj[key] === "") {
              cleaned[key] = null;
            } else {
              cleaned[key] = obj[key];
            }
          }
        });
        return cleaned;
      };

      let payload = { email: data.email };

      payload.logo = data.logo;

      if (userType === "Candidate") {
        payload = {
          ...payload,
          name: data.name,
          title: data.title,
          phone_number: data.phone_number,
          gender: data.gender,
          age: data.age,
          profile_visibility: data.profile_visibility,
          description: data.description,
        };
      } else if (userType === "Employer") {
        payload = {
          ...payload,
          company_name: data.company_name,
          phone: data.phone,
          website: data.website,
          company_type: data.company_type,
          company_location: data.company_location,
          description: data.description,
        };
      }

      // Clean the payload to remove undefined values
      payload = cleanData(payload);

      const { success, error: apiError } = await updateUserByAdmin(
        selectedUserId,
        payload
      );
      if (!success) {
        throw new Error(apiError || "Failed to update user.");
      }

      // Reset form and reload the selected user's data after successful update
      reset();
      handleUserSelection(
        userOptions.find((option) => option.value === selectedUserId) || null
      );
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
      console.error("Error during user update:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      // Use the new complete deletion function that removes both Auth and Firestore data
      const { success, error } = await deleteUserCompletelyByAdmin(
        selectedUserId
      );
      if (!success)
        throw new Error(error || "Failed to delete user completely.");
      setShowDeleteModal(false);
      setSelectedUserId("");
      reset();
      // Success toast is already shown in the deleteUserCompletelyByAdmin function
    } catch (err) {
      setDeleteError(err.message || "An unexpected error occurred.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (usersLoading) {
    return (
      <div className="ls-widget">
        <div className="tabs-box">
          <div className="widget-title">
            <h4>Edit Users</h4>
          </div>
          <div className="widget-content">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "50px",
              }}
            >
              <CircularLoader />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="ls-widget">
        <div className="tabs-box">
          <div className="widget-title">
            <h4>Edit Users</h4>
          </div>
          <div className="widget-content">
            <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
              Error loading users: {usersError.message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ls-widget">
      <div className="tabs-box">
        <div className="widget-title">
          <h4>Edit Users</h4>
        </div>

        <div className="widget-content">
          {/* User Selection */}
          <div className="form-group col-lg-12 col-md-12 mb-4">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "15px",
                fontWeight: "500",
                marginBottom: "6px",
              }}
            >
              Select User to Edit
            </label>
            <Select
              value={
                userOptions.find((option) => option.value === selectedUserId) ||
                null
              }
              onChange={handleUserSelection}
              options={userOptions}
              placeholder="Search and select a user to edit..."
              isClearable
              isSearchable
              className="basic-single-select"
              classNamePrefix="select"
              noOptionsMessage={() => "No users found"}
              loadingMessage={() => "Loading users..."}
              isLoading={usersLoading}
            />
          </div>

          {/* Edit Form */}
          {selectedUserId && (
            <FormProvider {...methods}>
              <form
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(onSubmit)();
                  }
                }}
                onSubmit={handleSubmit(onSubmit)}
                className="default-form"
              >
                <div className="row">
                  {userType === "Employer" && (
                    <div className="form-group col-lg-12 col-md-12">
                      <AdminLogoUpload />
                    </div>
                  )}

                  {/* Common Fields */}
                  <div className="form-group col-lg-6 col-md-12">
                    <InputField
                      label="Email"
                      name="email"
                      placeholder="user@example.com"
                      required
                      fieldType="Email"
                      defaultValue=""
                      disabled={false}
                    />
                  </div>

                  {/* Conditional Fields Based on User Type */}
                  {userType === "Candidate" ? (
                    <>
                      {/* Candidate Fields */}
                      <div className="form-group col-lg-6 col-md-12">
                        <InputField
                          label="Full Name"
                          name="name"
                          placeholder="John Doe"
                          required
                          fieldType="Name"
                          defaultValue=""
                          disabled={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <InputField
                          label="Job Title"
                          name="title"
                          placeholder="Software Developer"
                          fieldType="Text"
                          defaultValue=""
                          disabled={false}
                          required={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <InputField
                          label="Phone"
                          name="phone_number"
                          placeholder="1234567890"
                          fieldType="Phone"
                          defaultValue=""
                          disabled={false}
                          required={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <SelectField
                          label="Gender"
                          name="gender"
                          options={GENDERS}
                          placeholder="Select a gender"
                          required={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <SelectField
                          label="Age"
                          name="age"
                          options={AGE_OPTIONS}
                          placeholder="Select age"
                          required={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <SelectField
                          label="Profile Visibility"
                          name="profile_visibility"
                          options={PROFILE_VISIBILITY_OPTIONS}
                          placeholder="Select visibility"
                          required={false}
                        />
                      </div>

                      <div className="form-group col-lg-12 col-md-12">
                        <TextAreaField
                          label="Description"
                          name="description"
                          placeholder="Tell us about yourself..."
                          minLength={10}
                          maxLength={1000}
                          required={false}
                        />
                      </div>
                    </>
                  ) : userType === "Employer" ? (
                    <>
                      {/* Employer Fields */}
                      <div className="form-group col-lg-6 col-md-12">
                        <InputField
                          label="Company Name"
                          name="company_name"
                          placeholder="Company Name"
                          required
                          fieldType="Name"
                          defaultValue=""
                          disabled={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <InputField
                          label="Phone"
                          name="phone"
                          placeholder="1234567890"
                          required
                          fieldType="Phone"
                          defaultValue=""
                          disabled={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <InputField
                          label="Website"
                          name="website"
                          placeholder="www.example.com"
                          fieldType="URL"
                          defaultValue=""
                          disabled={false}
                          required={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <AutoSelect
                          label="Company Type"
                          placeholder={
                            sectorsLoading
                              ? "Loading sectors..."
                              : "Select company types"
                          }
                          name="company_type"
                          options={sectors}
                          required
                          defaultValue={[]}
                          disabled={sectorsLoading}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <SelectField
                          label="Location"
                          name="company_location"
                          options={states}
                          placeholder={
                            statesLoading
                              ? "Loading states..."
                              : "Select a state"
                          }
                          required
                          disabled={statesLoading}
                        />
                      </div>

                      <div className="form-group col-lg-12 col-md-12">
                        <TextAreaField
                          label="About Company"
                          name="description"
                          placeholder="Tell us about your company..."
                          minLength={10}
                          maxLength={1000}
                          required={false}
                        />
                      </div>
                    </>
                  ) : null}

                  {/* Display error message if exists */}
                  {error && (
                    <div className="form-group col-12" style={{ color: "red" }}>
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div
                    className="form-group col-lg-12 col-md-12 d-flex justify-content-between align-items-center"
                    style={{ marginTop: 20, gap: 16 }}
                  >
                    <button
                      className={`theme-btn ${
                        loading ? "btn-style-three" : "btn-style-one"
                      }`}
                      type="submit"
                      disabled={loading || deleteLoading}
                    >
                      {loading ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <CircularLoader />
                          <p style={{ margin: 0 }}>Updating User...</p>
                        </div>
                      ) : (
                        "Update User"
                      )}
                    </button>
                    <button
                      type="button"
                      className="theme-btn btn-style-one"
                      style={{ background: "#dc3545", color: "#fff" }}
                      onClick={() => setShowDeleteModal(true)}
                      disabled={loading || deleteLoading}
                    >
                      {deleteLoading ? "Deleting..." : "Delete Account"}
                    </button>
                  </div>
                </div>
              </form>
            </FormProvider>
          )}

          {/* Delete Account Button and Modal */}
          {selectedUserId && (
            <>
              <div
                className="form-group col-lg-12 col-md-12 text-left"
                style={{ marginTop: 20 }}
              >
                {/* This button is now part of the form's submit row */}
              </div>
              {showDeleteModal && (
                <div
                  className="modal-overlay"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0,0,0,0.4)",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className="modal-content"
                    style={{
                      background: "#fff",
                      padding: 32,
                      borderRadius: 8,
                      maxWidth: 400,
                      width: "100%",
                      boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
                    }}
                  >
                    <h4 style={{ marginBottom: 16 }}>Confirm Deletion</h4>
                    <p>
                      Are you sure you want to delete this user and all related
                      data? This action cannot be undone.
                    </p>
                    {deleteError && (
                      <div style={{ color: "red", marginBottom: 8 }}>
                        {deleteError}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 12,
                        marginTop: 24,
                      }}
                    >
                      <button
                        type="button"
                        className="theme-btn btn-style-one"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={deleteLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="theme-btn btn-style-one"
                        style={{ background: "#dc3545", color: "#fff" }}
                        onClick={handleDeleteUser}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? "Deleting..." : "Yes, Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Instructions when no user is selected */}
          {!selectedUserId && (
            <div
              className="text-center"
              style={{ padding: "40px", color: "#666" }}
            >
              <p>
                Please select a user from the dropdown above to edit their
                information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditUser;
