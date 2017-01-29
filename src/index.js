import express from 'express';

const app = express();

app.set('views', 'src/views')
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('dashboard/index', {
    title: 'Hey',
    message: 'Hello there!',
  });
});

app.listen(3000, () => {
  console.log('open http://localhost:3000/');
});
