import { VALID_CATEGORIES } from "../constants/categories.js";

// 1. Define special acronyms in categories setlist that are in all caps.
const ACRONYMS = ["SQL", "IOT"];

export const normalizeCategories = (categories) => {
// If the input isn't an array, return empty to prevent errors.
    if (!Array.isArray(categories)) return [];
// Helper function to capitalize the first letter of each word (Title Case).
    const toTitleCase = (str) =>
        str
            .trim()
            .split(/\s+/) // Splits by any whitespace to handle multiple spaces.
            .map((word) => {
                const upperWord = word.toUpperCase();
                // 2. If the word is an acronym, return it fully capitalized.
                if (ACRONYMS.includes(upperWord)) {
                return upperWord;
                }
                // 3. Otherwise, apply standard Title Case.
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(" ");
    
    return [
        ...new Set(
            categories
                .map((cat) => toTitleCase(cat))
        ),
    ];
};

export const validateCategory = (categories) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return {
      isValid: false,
      message: "categories must be a non-empty array"
    };
  }

  const normalizedCategories = normalizeCategories(categories);

  const invalidCategories = normalizedCategories.filter(
    (category) => !VALID_CATEGORIES.includes(category)
  );

  if (invalidCategories.length > 0) {
    return {
      isValid: false,
      message: "One or more categories are invalid",
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
      error: "Missing JSON body"
    };
  }

  const { title, description, category, complexity } = body;

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return {
      isValid: false,
      error: "title is required (string, min 3 chars)"
    };
  }

  if (!description || typeof description !== "string" || description.trim().length < 10) {
    return {
      isValid: false,
      error: "description is required (string, min 10 chars)"
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
    normalizedCategory: categoryValidation.normalizedCategories
  };
};