const { body } = require("express-validator");

exports.createDamageReportValidation = [
  body("disasterId")
    .notEmpty()
    .withMessage("Disaster ID is required"),

  body("reporterName")
    .notEmpty()
    .withMessage("Reporter name is required")
    .isLength({ min: 3 })
    .withMessage("Reporter name must be at least 3 characters"),

  body("contactNumber")
    .notEmpty()
    .withMessage("Contact number is required")
    .isLength({ min: 10, max: 15 })
    .withMessage("Invalid contact number"),

  body("damageType")
    .isIn(["Infrastructure", "Housing", "Medical", "Agriculture", "Other"])
    .withMessage("Invalid damage type"),

  body("damageDescription")
    .notEmpty()
    .withMessage("Damage description is required"),

  body("estimatedLoss")
    .optional()
    .isNumeric()
    .withMessage("Estimated loss must be a number"),
];