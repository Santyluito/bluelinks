const Url = require("../models/Url");
const { nanoid } = require("nanoid");

const leerUrls = async (req, res) => {
  // console.log(req.user);

  try {
    const urls = await Url.find({ user: req.user.id }).lean();
    res.render("home", { urls });
  } catch (error) {
    // console.log(error);
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
    // res.send("aqui fallo algo");
  }
};

const agregarUrl = async (req, res) => {
  const { origin } = req.body;

  try {
    const url = new Url({ origin, shortURL: nanoid(8), user: req.user.id });
    await url.save();
    req.flash("mensajes", [{ msg: "Url agregada" }]);
    res.redirect("/");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
    // console.log(error);
    // res.send("error algo fallo");
  }
};

const eliminarUrl = async (req, res) => {
  // console.log(req.user.id);
  const { id } = req.params;
  try {
    // await Url.findByIdAndDelete(id);
    const url = await Url.findById(id);
    if (!url.user.equals(req.user.id)) {
      throw new Error("No es tu url");
    }
    await url.remove();
    req.flash("mensajes", [{ msg: "Url eliminada" }]);
    res.redirect("/");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
    // console.log(error);
    // res.send("aqui fallo algo");
  }
};

const editarUrlForm = async (req, res) => {
  const { id } = req.params;
  try {
    const url = await Url.findById(id).lean();
    if (!url.user.equals(req.user.id)) {
      throw new Error("No es tu url");
    }
    res.render("home", { url });
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
    // console.log(error);
    // res.send("aqui fallo algo");
  }
};

const editarUrl = async (req, res) => {
  const { id } = req.params;
  const { origin } = req.body;
  try {
    const url = await Url.findById(id);
    if (!url.user.equals(req.user.id)) {
      throw new Error("No es tu url");
    }
    await url.updateOne({ origin })
    req.flash("mensajes", [{ msg: 'Url editada' }]);
    // await Url.findByIdAndUpdate(id, { origin });
    res.redirect("/");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
    // console.log(error);
    // res.send("aqui fallo algo");
  }
};

const redireccionamiento = async (req, res) => {
  const { shortURL } = req.params;
  try {
    const urlDB = await Url.findOne({ shortURL });
    res.redirect(urlDB.origin);
    // console.log(shortUrl);
  } catch (error) {
    console.log(error);
    req.flash("mensajes", [{ msg: "No existe esta url configurada" }]);
    return res.redirect("/auth/login");
  }
};

module.exports = {
  leerUrls,
  agregarUrl,
  eliminarUrl,
  editarUrlForm,
  editarUrl,
  redireccionamiento,
};
