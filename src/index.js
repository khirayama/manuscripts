import express from 'express';
import bodyParser from 'body-parser';
import {Script, Link} from './models';

const patterns = {
  //URLs starting wth http://, https://, ftp:// or /
  LINK: /((https?:\/|ftp:\/|)\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,

  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  WWW_LINK: /(^|[^\/])(www\.[\S]+(\b|$))/gim,
};

function linkify(inputText) {
  let replacedText = '';
  replacedText = inputText.replace(patterns.LINK, '<a href="$1" target="_blank">$1</a>');
  replacedText = replacedText.replace(patterns.WWW_LINK, '$1<a href="http://$2" target="_blank">$2</a>');
  return replacedText;
}

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
    const scriptBodyHTML = linkify(script.body);
    res.render('scripts/show', {
      script,
      scriptBodyHTML,
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
