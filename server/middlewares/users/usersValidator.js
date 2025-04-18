const { check, validationResult } = require("express-validator");
const User = require("../../models/user.model");
const path = require("path");
const fs = require("fs");

const addUserValidator = [
  check("name")
    .isLength({ min: 1 })
    .withMessage("Name is required")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("Name must not contain anything other than alphabet")
    .custom((value, { req }) => {
      switch (true) {
        case value.length === 1:
          throw new Error("Name must be at least 2 characters long");
        case value.length > 20:
          throw new Error("Name cannot be more than 20 characters long");
        default:
          return true;
      }
    })
    .trim(),
  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .trim()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error(
            "There is already an account associated with this email address"
          );
        }
      } catch (err) {
        throw err;
      }
    }),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character"),
  check("role").default("general"),
];

const addUserValidatorHandler = (req, res, next) => {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();

  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    if (req.files && req.files.length > 0) {
      const { filename } = req.files[0];
      const filePath = path.join(
        __dirname,
        `../../assets/userAvatars/${filename}`
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
        }
        console.log(`${filePath} was deleted`);
      });
    }
    res
      .status(400)
      .json({ errors: Object.values(mappedErrors).map((error) => error.msg) });
  }
};

module.exports = {
  addUserValidator,
  addUserValidatorHandler,
};
