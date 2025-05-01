export const checkValidDetails = (email, password) => {
  const errors = {};
  const isEmailValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(
    email
  );
  const isPasswordValid =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(
      password
    );

  if (!isEmailValid) errors.email = "Please enter a valid email";
  if (!isPasswordValid)
    errors.password =
      "Password must be 8characters minimum and include an uppercase letter, a lowercase letter, a number, and a special character (e.g., @.#$!%*?&)";
  return Object.keys(errors).length ? errors : null;
};
