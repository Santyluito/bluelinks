const { URL } = require("url");

const validarUrl = (req, res, next) => {
  try {
    const { origin } = req.body;
    const urlFrontEnd = new URL(origin);
    if (urlFrontEnd.origin !== "null") {
      if (urlFrontEnd.protocol === "http:" || urlFrontEnd.protocol === "https:") {
        return next();
      }
      throw new Error("tiene que tener https://");
    }
    throw new Error("no valida 😒");
  } catch (error) {
    if (error.message === "Invalid URL") {
      req.flash("mensajes", [{ msg: "URL no valida" }]);
      return res.redirect("/");
    } else {
      req.flash("mensajes", [{ msg: error.message }]);
    }
    // return res.send("url no valida");
  }
};

module.exports = validarUrl;
