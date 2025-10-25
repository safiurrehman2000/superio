"use client";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { InputField } from "@/components/inputfield/InputField";
import { TextAreaField } from "@/components/textarea/TextArea";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { successToast, errorToast } from "@/utils/toast";

const ContactForm = () => {
  const methods = useForm({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    mode: "onChange",
  });

  const { handleSubmit, reset } = methods;
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        successToast("Thank you! Your message has been sent successfully.");
        reset();
      } else {
        errorToast(result.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      errorToast("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-lg-6 col-md-12 col-sm-12 form-group">
            <InputField
              label="Your Name"
              name="name"
              type="text"
              placeholder="Your Name*"
              required={true}
              fieldType="name"
            />
          </div>
          {/* End .col */}

          <div className="col-lg-6 col-md-12 col-sm-12 form-group">
            <InputField
              label="Your Email"
              name="email"
              type="email"
              placeholder="Your Email*"
              required={true}
              fieldType="email"
            />
          </div>
          {/* End .col */}

          <div className="col-lg-12 col-md-12 col-sm-12 form-group">
            <InputField
              label="Subject"
              name="subject"
              type="text"
              placeholder="Subject*"
              required={true}
              fieldType="text"
            />
          </div>
          {/* End .col */}

          <div className="col-lg-12 col-md-12 col-sm-12 form-group">
            <TextAreaField
              label="Your Message"
              name="message"
              placeholder="Write your message..."
              required={true}
              minLength={10}
              maxLength={2000}
            />
          </div>
          {/* End .col */}

          <div className="col-lg-12 col-md-12 col-sm-12 form-group">
            <button
              className="theme-btn btn-style-one"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <CircularLoader /> : "Send Message"}
            </button>
          </div>
          {/* End .col */}
        </div>
      </form>
    </FormProvider>
  );
};

export default ContactForm;
