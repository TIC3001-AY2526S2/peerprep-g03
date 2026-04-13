export function normaliseEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : email;
}