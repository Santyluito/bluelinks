const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const urls = [
    { origin: "www.google.com/bluuweb1", shortURL: "jbajsdjhn1" },
    { origin: "www.google.com/bluuweb2", shortURL: "jbajsdjh2n" },
    { origin: "www.google.com/bluuweb3", shortURL: "jbajsdjhn3" },
    { origin: "www.google.com/bluuweb3", shortURL: "jbajsdjhn3" },
  ]
  res.render('home', { urls });
});

module.exports = router