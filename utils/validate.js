export const checkValidDetails = (email, password, field) => {
  const errors = {};

  if (field === "email") {
    const isEmailValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(
      email
    );
    if (!isEmailValid) errors.email = "Please enter a valid email";
  } else if (field === "password") {
    const isPasswordValid =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(
        password
      );
    if (!isPasswordValid)
      errors.password =
        "Password must be 8 characters minimum and include an uppercase letter, a lowercase letter, a number, and a special character (e.g., @.#$!%*?&)";
  }

  return Object.keys(errors).length ? errors : null;
};
