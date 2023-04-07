const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL;
const MAX_CACHE_SIZE = 1000;

let avatarsCache = [];
let avatarsIndex = new Map();

// Add the following new function to delete all entries in the avatars database

deleteAllAvatarsFromDB = async () => {
  try {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db('talktoai');
    const collection = db.collection('avatars');

    await collection.deleteMany({});

    client.close();
  } catch (err) {
    console.log(err);
  }
}

async function main() {
    try {
      await deleteAllAvatarsFromDB();
      console.log("All avatars have been deleted from the database.");
    } catch (err) {
      console.log(err);
    }
  }
  
  // don't accidentally run this main();
  