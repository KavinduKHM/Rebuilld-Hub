const { body } = require("express-validator");

exports.createDisasterValidation = [
  body("title")
    .notEmpty()
    .withMessage("Disaster title is required"),

  body("type")
    .isIn(["Flood", "Earthquake", "Landslide", "Cyclone", "Other"])
    .withMessage("Invalid disaster type"),

  body("description")
    .notEmpty()
    .withMessage("Description is required"),

  body("severityLevel")
    .optional()
    .isIn(["Low", "Medium", "High", "Critical"])
    .withMessage("Invalid severity level"),

  body("requiredSkills")
    .optional()
    .isArray()
    .withMessage("requiredSkills must be an array of strings"),

  body("requiredSkills.*")
    .optional()
    .isString()
    .withMessage("Each required skill must be a string"),

  body("suggestedVolunteerCount")
    .optional()
    .isInt({ min: 1 })
    .withMessage("suggestedVolunteerCount must be a positive integer"),

  body("location.latitude")
    .optional()
    .isFloat()
    .withMessage("Latitude must be a number"),

  body("location.longitude")
    .optional()
    .isFloat()
    .withMessage("Longitude must be a number"),
];