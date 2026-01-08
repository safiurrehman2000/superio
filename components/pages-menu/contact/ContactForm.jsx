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
        successToast("Dank u wel! Uw bericht is succesvol verzonden.");
        reset();
      } else {
        errorToast(result.error || "Het verzenden van het bericht is mislukt. Probeer het opnieuw.");
      }
    } catch (error) {
      console.error("Fout bij het verzenden van het contactformulier:", error);
      errorToast("Er is een fout opgetreden. Probeer het later opnieuw.");
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
              label="Jouw naam"
              name="name"
              type="text"
              placeholder="Jouw naam*"
              required={true}
              fieldType="name"
            />
          </div>
          {/* End .col */}

          <div className="col-lg-6 col-md-12 col-sm-12 form-group">
            <InputField
              label="Jouw e-mail"
              name="email"
              type="email"
              placeholder="Jouw e-mail*"
              required={true}
              fieldType="email"
            />
          </div>
          {/* End .col */}

          <div className="col-lg-12 col-md-12 col-sm-12 form-group">
            <InputField
              label="Onderwerp"
              name="subject"
              type="text"
              placeholder="Onderwerp*"
              required={true}
              fieldType="text"
            />
          </div>
          {/* End .col */}

          <div className="col-lg-12 col-md-12 col-sm-12 form-group">
            <TextAreaField
              label="Jouw bericht"
              name="message"
              placeholder="Schrijf je bericht..."
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
              {isLoading ? <CircularLoader /> : "Stuur bericht"}
            </button>
          </div>
          {/* End .col */}
        </div>
      </form>
    </FormProvider>
  );
};

export default ContactForm;
