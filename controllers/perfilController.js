const formidable = require("formidable");
const Jimp = require('jimp');
const path = require("path");
const fs = require("fs");
const User = require("../models/User");

module.exports.formPerfil = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.render("perfil", { user: req.user, imagen: user.imagen });
  } catch (error) {
    req.flash("mensajes", [{ msg: 'Error al leer el usuario' }]);
    return res.redirect("/perfil");
  }
};

module.exports.editarFotoPerfil = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.maxFileSize = 50 * 1024 * 1025; //5mb
  path
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        throw new Error("fallo la subida de imagen");
      }
      // console.log(fields)
      // console.log(files)

      const file = files.myFile;
      if (file.originalFilename === "") {
        throw new Error("Porfavor agrega una imagen");
      }
      if (!(file.mimetype === "image/jpeg" || file.mimetype === "image/png")) {
        throw new Error("Porfavor agrega una imagen .jpg o .png");
      }
      if (file.size > 50 * 1024 * 1025) {
        throw new Error("Porfavor agrega una imagen de menos de 5mb por favor");
      }

      const extension = file.mimetype.split("/")[1];
      const dirFile = path.join(
        __dirname,
        `../public/img/profiles/${req.user.id}.${extension}`
      );
      fs.copyFileSync(file.filepath, dirFile);
      // console.log(dirFile);
      const image = await Jimp.read(dirFile)
      image.resize(200, 200).quality(90).writeAsync(dirFile)

      const user = await User.findById(req.user.id)
      user.imagen = `${req.user.id}.${extension}`
      await user.save()

      req.flash("mensajes", [{ msg: "ya se subio la imagen" }]);
      // return res.redirect("/perfil");
    } catch (error) {
      req.flash("mensajes", [{ msg: error.message }]);
    } finally {
      return res.redirect("/perfil");
    }
  });
};
