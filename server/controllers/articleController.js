const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);

const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db("ai_news");
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

const fetchArticleById = async (db, id) => {
  const article = await db.collection("articles").findOne({ _id: new MongoClient.ObjectId(id) });
  return article;
};

module.exports = {
  connectToDatabase,
  insertArticle,
  fetchArticles,
  fetchArticleById,
};
