export function validatePassword(password) {
  const errors = [];

  if (typeof password !== "string") {
    errors.push("Password must be a string");
    return {
      isValid: false,
      errors,
    };
  }

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  if (/\s/.test(password)) {
    errors.push("Password must not contain spaces");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}