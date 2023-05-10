const { MongoClient } = require('mongodb');
const NodeCache = require('node-cache');

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);
const cache = new NodeCache({ stdTTL: 604800 }); // Cache for 1 week (in seconds)

const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db("ainews");
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};

const insertArticle = async (db, article) => {
  const result = await db.collection("articles").insertOne(article);
  return result.insertedId;
};

const fetchArticles = async (db) => {
  const articles = await db.collection("articles").find().toArray();
  return articles;
};

const fetchArticleByTitleId = async (db, id) => {
  const cacheKey = `article-${id}`;
let article = cache.get(cacheKey);

  if (!article) {
    article = await db.collection("articles").findOne({ titleId: id });
    cache.set(cacheKey, article);
  }

  return article;
};

const fetchLatestArticles = async (db) => {
  const cacheKey = 'latest-articles';
  let articles = cache.get(cacheKey);

  if (!articles) {
    articles = await db.collection("articles")
      .find({}, { projection: { title: 1, summary: 1, imageURL: 1 } })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    cache.set(cacheKey, articles);
  }

  return articles;
};

module.exports = {
  connectToDatabase,
  insertArticle,
  fetchArticles,
  fetchArticleByTitleId,
  fetchLatestArticles
};
