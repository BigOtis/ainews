const express = require('express');
const router = express.Router();
const resume = require('./controllers/ResumeAPI');

router.get('/', (req, res) => {
  res.send('Hello, Leroy!');
});

router.post('/optimize-resume', resume.resumeOptimizerHandler);

module.exports = router;