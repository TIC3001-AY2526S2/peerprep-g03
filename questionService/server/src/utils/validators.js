import { VALID_CATEGORIES, ACRONYMS, MAX_CATEGORY_COUNT } from "../constants/categories.js";

// 1. Define special acronyms in categories setlist that are in all caps.

export const normalizeCategories = (categories) => {
// If the input isn't an array, return empty to prevent errors.
  if (!Array.isArray(categories)) return [];

// Helper function to capitalize the first letter of each word (Title Case).
  const toTitleCase = (str) =>
    str
      .trim()
      .split(/\s+/)
      .map((word) => {
        const upperWord = word.toUpperCase();

        if (ACRONYMS.includes(upperWord)) {
          return upperWord;
        }

        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");

  const normalized = categories
    .filter((cat) => typeof cat === "string" && cat.trim().length > 0)
    .map((cat) => toTitleCase(cat))
    .map((cat) => {
      const matchedCategory = VALID_CATEGORIES.find(
        (validCategory) => validCategory.toLowerCase() === cat.toLowerCase()
      );
      return matchedCategory || null;
    })
    .filter(Boolean);

  return [...new Set(normalized)].sort((a, b) => a.localeCompare(b));
};

export const validateCategory = (categories) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return {
      isValid: false,
      message: "Category must contain at least 1 value."
    };
  }

  if (categories.length > MAX_CATEGORY_COUNT) {
    return {
      isValid: false,
      message: `Category cannot contain more than ${MAX_CATEGORY_COUNT} values.`
    };
  }

  const normalizedCategories = normalizeCategories(categories);

  const invalidCategories = normalizedCategories.filter(
    (category) => !VALID_CATEGORIES.includes(category)
  );

  if (invalidCategories.length > 0) {
    return {
      isValid: false,
      message: "One or more categories are invalid.",
      invalidCategories
    };
  }

  return {
    isValid: true,
    normalizedCategories
  };
};

// simple validation helper
export const validateQuestionPayload = (body) => {
  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      error: "Missing JSON body."
    };
  }

  const { title, description, category, complexity } = body;

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return {
      isValid: false,
      error: "Title is required and must be at least 3 characters."
    };
  }

  if (!description || typeof description !== "string" || description.trim().length < 10) {
    return {
      isValid: false,
      error: "Description is required and must be at least 10 characters."
    };
  }

  const categoryValidation = validateCategory(category);
  if (!categoryValidation.isValid) {
    return {
      isValid: false,
      error: categoryValidation.message,
      invalidCategories: categoryValidation.invalidCategories || []
    };
  }

  const complexityLevels = ["Easy", "Medium", "Hard"];
  if (
    !complexity ||
    typeof complexity !== "string" ||
    !complexityLevels.includes(complexity)
  ) {
    return {
      isValid: false,
      error: `complexity must be one of: ${complexityLevels.join(", ")}`
    };
  }

  return {
    isValid: true,
    normalizedCategories: categoryValidation.normalizedCategories
  };
};