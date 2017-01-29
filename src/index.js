import express from 'express';
import {Script, Link} from './models';

const app = express();

app.set('views', 'src/views');
app.set('view engine', 'pug');

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

app.listen(3000, () => {
  console.log('open http://localhost:3000/');
});
