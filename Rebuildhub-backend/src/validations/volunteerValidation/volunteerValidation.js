import { body, validationResult } from "express-validator";

const registerVolunteerValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("phone")
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^[0-9+\-\s()]{10,15}$/)
    .withMessage("Please enter a valid phone number"),

  body("district").notEmpty().withMessage("District is required"),

  body("skills")
    .isArray({ min: 1 })
    .withMessage("Skills must be a non-empty array")
    .custom((skills) => {
      if (!skills.every((skill) => typeof skill === "string")) {
        throw new Error("All skills must be strings");
      }
      return true;
    }),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

export { registerVolunteerValidation, validate };
