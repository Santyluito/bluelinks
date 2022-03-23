const User = require("../models/User");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const { nanoid } = require("nanoid");
require("dotenv").config();

const registerForm = (req, res) => {
  res.render("register");
};

const loginForm = (req, res) => {
  res.render("login");
};

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.json(errors);
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/register");
  }

  const { userName, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) throw new Error("ya existe el usuario");

    user = new User({ userName, email, password, tokenConfirm: nanoid() });
    await user.save();

    //enviar correo electronico con la conefirmacion de la cuenta
    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.USEREMAIL,
        pass: process.env.PASSEMAIL,
      },
    });

    await transport.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: user.email, // list of receivers
      subject: "Verifica tu cuenta de correo ✔", // Subject line
      // text: "Hello world?", // plain text body
      html: `<a href="${PATHHEROKU || "http://localhost:5000"}/auth/confirmar/${user.tokenConfirm}">Verifica tu cuenta aqui: </a>`, // html body
    });

    req.flash("mensajes", [
      { msg: "Revisa tu correo electronico para validar registro." },
    ]);
    res.redirect("/auth/login");
  } catch (error) {
    // res.json({ error: error.message });
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/register");
  }
  // res.json(req.body)
};

const confirmarCuenta = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ tokenConfirm: token });
    if (!user) throw new Error("No existe este usuario");
    user.cuentaConfirmada = true;
    user.tokenConfirm = null;
    await user.save();
    req.flash("mensajes", [
      { msg: "Cuenta Verificda, puedes iniciar sesion." },
    ]);
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
    // res.json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/login");
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("No existe este email");

    if (!user.cuentaConfirmada) throw new Error("Falta confirmar cuenta");

    if (!(await user.comparePassword(password)))
      throw new Error("Contrasena no correcta");

    // me esta creando la sesion de usuario a travez de passport
    req.login(user, function (err) {
      if (err) throw new Error("Error al crear la sesion");
      res.redirect("/");
    });
  } catch (error) {
    // console.log(error);
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
    // res.send(error.message);
  }
};

const cerrarSesion = (req, res) => {
  req.logout();
  return res.redirect("/auth/login");
};

module.exports = {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion,
};
