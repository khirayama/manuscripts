import express from 'express';
import bodyParser from 'body-parser';
import {Script, Link} from './models';

const app = express();

app.set('views', 'src/views');
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  Script.findAll({limit: 30}).then(scripts => {
    Link.findAll({limit: 30}).then(links => {
      res.render('dashboard/index', {
        title: 'Manuscripts',
        scripts,
        links,
      });
    });
  });
});

app.get('/scripts/new', (req, res) => {
  res.render('scripts/new', {
    title: 'Write a script',
  });
});

app.get('/scripts/:id', (req, res) => {
  const scriptId = req.params.id;
  Script.findById(scriptId).then(script => {
    res.render('scripts/show', {
      script,
    });
  });
});

app.post('/scripts', (req, res) => {
  Script.create({
    title: req.body.title,
    body: req.body.body,
  }).then(script => {
    // TODO: create script and links
    // TODO: get link title when create
    res.redirect(`/scripts/${script.id}`);
  });
});

app.listen(3000, () => {
  console.log('open http://localhost:3000/');
});
