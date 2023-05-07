const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);

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
  const article = await db.collection("articles").findOne({ titleId: id});
  return article;
};


const fetchLatestArticles = async (db) => {
  const articles = await db.collection("articles")
    .find({}, { projection: { title: 1, summary: 1, imageURL: 1 } })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();
  return articles;
};

module.exports = {
  connectToDatabase,
  insertArticle,
  fetchArticles,
  fetchArticleByTitleId,
  fetchLatestArticles
};
