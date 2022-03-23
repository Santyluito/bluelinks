const express = require("express");
const { body } = require("express-validator");

const {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion,
} = require("../controllers/authController");
const router = express.Router();

router.get("/register", registerForm);
router.post(
  "/register",
  [
    body("userName", "ingrese un nombre valido").trim().notEmpty().escape(),
    body("email", "ingrese un email valido").trim().isEmail().normalizeEmail(),
    body("password", "ingrese una contrasena minimo 6 caracteres")
      .isLength({ min: 6 })
      .escape()
      .custom((value, { req }) => {
        if (value !== req.body.repassword) {
          throw new Error('no coinciden las contrasenas')
        } else {
          return value;
        }

      })
  ],
  registerUser
);
router.get("/confirmar/:token", confirmarCuenta);
router.get("/login", loginForm);
router.post("/login",[
  body("email", "ingrese un email valido").trim().isEmail().normalizeEmail(),
  body("password", "ingrese una contrasena minimo 6 caracteres")
      .isLength({ min: 6 })
      .escape()
], loginUser);

router.get('/logout', cerrarSesion);

module.exports = router;
