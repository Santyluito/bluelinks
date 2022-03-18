const express = require('express');
const { create } = require('express-handlebars');

const app = express();

const hbs = create({
  extname: ".hbs",
  partialsDir: ["Views/components"]
})

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(express.static(__dirname + "/public"));
app.use('/', require('./routes/home'));
app.use('/auth', require('./routes/auth'));

app.listen(5000, () => {
  console.log('😍 app listening on port 5000!');
});

//Run app, then load http://localhost:5000 in a browser to see the output.
