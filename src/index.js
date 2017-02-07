import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import client from 'cheerio-httpcli';

import Sequelize from 'sequelize';
import normalizeUrl from 'normalize-url';

import {Script, Link, ScriptLink} from './models';

const patterns = {
  //URLs starting wth http://, https://, ftp:// or /
  LINK: /((https?:|ftp:|)\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,

  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  WWW_LINK: /(^|[^\/])(www\.[\S]+(\b|$))/gim,
};

function linkify(inputText) {
  let replacedText = '';
  replacedText = inputText.replace(patterns.LINK, '<a href="$1" target="_blank">$1</a>');
  replacedText = replacedText.replace(patterns.WWW_LINK, '$1<a href="http://$2" target="_blank">$2</a>');
  return replacedText;
}

function captureUniqueUrls(body) {
  return [].concat(
    body.match(patterns.LINK) || [],
    body.match(patterns.WWW_LINK) || []
  ).map(link => {
    return normalizeUrl(link, {
      normalizeProtocol: true,
      normalizeHttps: true,
      removeQueryParameters: [/.+/],
      removeTrailingSlash: true,
      stripFragment: true,
      stripWWW: true,
    });
  }).filter((url, index, self) => {
    return self.indexOf(url) === index;
  });
}

const app = express();

app.set('views', 'src/views');
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  Script.findAll({limit: 30}).then(scripts => {
    Link.findAll({limit: 30}).then(links => {
      const Promises = [];
      res.render('dashboard/index', {
        title: 'Manuscripts',
        scripts,
        links,
      });
    });
  });
});

app.get('/scripts/new', (req, res) => {
  const ref = `${req.protocol}://${req.headers.host}/scripts/${req.query.id}`;

  res.render('scripts/new', {
    title: 'Write a script',
    ref: (req.query.id) ? ref : null,
  });
});

app.post('/scripts', (req, res) => {
  Script.create({
    title: req.body.title,
    body: req.body.body,
  }).then(script => {
    const urls = captureUniqueUrls(script.body);
    // FIXME: want to use bulkCreate.
    // But I enconter this same issue.
    // https://github.com/sequelize/sequelize/issues/3908
    urls.forEach(url => {
      client.fetch(url, (err, $, res) => {
        const title = $('title').text();

        Link.findOrCreate({
          where: {url},
          defaults: {url, title},
        }).spread(link => {
          ScriptLink.create({
            scriptId: script.id,
            linkId: link.id,
          });
        });
      });
    });

    res.redirect(`/scripts/${script.id}`);
  });
});

app.get('/scripts/:id', (req, res) => {
  const scriptId = req.params.id;
  Script.findById(scriptId).then(script => {
    const scriptBodyHTML = linkify(script.body);

    Link.findAll({
      where: {url: 'http://localhost:3000/scripts/' + scriptId},
    }).then(links => {
      const link = links[0];
      if (link) {
        ScriptLink.findAll({
          where: {linkId: link.id},
        }).then(scriptLinks => {
          if (scriptLinks.length) {
            const mentionedScripts = [];
            scriptLinks.forEach(scriptLink => {
              Script.findById(scriptLink.id).then((mentionedScript) => {
                mentionedScripts.push(mentionedScript);
                if (scriptLink.id === scriptLinks[scriptLinks.length - 1].id) {
                  res.render('scripts/show', {
                    script,
                    scriptBodyHTML,
                    id: scriptId,
                    mentioned: mentionedScripts,
                  });
                }
              });
            });
          } else {
            res.render('scripts/show', {
              script,
              scriptBodyHTML,
              id: scriptId,
              mentioned: [],
            });
          }
        });
      } else {
        res.render('scripts/show', {
          script,
          scriptBodyHTML,
          id: scriptId,
          mentioned: [],
        });
      }
    });
  });
});

app.listen(3000, () => {
  console.log('open http://localhost:3000/');
});
