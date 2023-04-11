const express = require('express');
const router = express.Router();
const resume = require('./controllers/ResumeAPI');
const { insertArticle, fetchArticles, fetchArticleById } = require('./controllers/articleController');

router.get('/', (req, res) => {
  res.send('Hello, Leroy!');
});

router.post('/optimize-resume', resume.resumeOptimizerHandler);

router.post('/articles', async (req, res) => {
  const article = req.body;
  try {
    const id = await insertArticle(req.app.locals.db, article);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to insert article' });
  }
});

router.get('/articles', async (req, res) => {
  try {
    const articles = await fetchArticles(req.app.locals.db);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

router.get('/articles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const article = await fetchArticleById(req.app.locals.db, id);
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
    } else {
      res.json(article);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

module.exports = router;
