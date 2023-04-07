const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL;
const MAX_CACHE_SIZE = 1000;

let avatarsCache = [];
let avatarsIndex = new Map();

// save a given avatar to the database
exports.saveAvatarToDB = async (name, img_url, creatorIP) => {
  try {
    const cleanName = name.replace(/[^a-zA-Z ]/g, "").replace(/\s/g, '').toLowerCase();

    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db('talktoai');
    const collection = db.collection('avatars');

    const doc = {
      name: cleanName,
      img_url: img_url,
      creatorIP: creatorIP,
    };

    await collection.insertOne(doc);

    addToCache(doc);

    client.close();
  } catch (err) {
    console.log(err);
  }
}

// get a given avatar from the database
exports.getAvatarFromDB = async (name) => {
  try {
    const cleanName = name.replace(/[^a-zA-Z ]/g, "").replace(/\s/g, '').toLowerCase();

    const cachedAvatar = getFromCache(cleanName);

    if (cachedAvatar) {
      return cachedAvatar;
    }

    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db('talktoai');
    const collection = db.collection('avatars');

    const result = await collection.findOne({ name: cleanName });

    client.close();

    if (result) {
      addToCache(result);
    }

    return result ? result.img_url : null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

// a local cache to store the most recently used avatars
function addToCache(avatar) {
  if (avatarsCache.length >= MAX_CACHE_SIZE) {
    const removedAvatar = avatarsCache.shift();
    avatarsIndex.delete(removedAvatar.name);
  }

  avatarsCache.push(avatar);
  avatarsIndex.set(avatar.name, avatar);
}

function getFromCache(name) {
  const avatar = avatarsIndex.get(name);
  return avatar ? avatar.img_url : null;
}

// save stats about the number of messages sent by each user
exports.saveStatsToDB = async (name, creatorIP) => {
    try {
      // clean the name text by removing any special characters, numbers, and spaces
      const cleanName = name.replace(/[^a-zA-Z ]/g, "").replace(/\s/g, '').toLowerCase();
  
      // connect to the MongoDB database
      const client = await MongoClient.connect(url, { useUnifiedTopology: true });
      const db = client.db('talktoai');
  
      // create the stats collection if it doesn't exist
      const collection = db.collection('stats');
      await collection.createIndex({ name: 1 }, { unique: true });
  
      // update the document for the given name with the number of messages sent
      const nameDoc = await collection.findOneAndUpdate(
        { name: cleanName },
        { $inc: { messages: 1 } },
        { upsert: true, returnOriginal: false }
      );
  
      // create the IP collection if it doesn't exist
      const ipCollection = db.collection('ip_stats');
      await ipCollection.createIndex({ creatorIP: 1 }, { unique: true });
  
      // update the document for the given IP with the number of messages sent
      const ipDoc = await ipCollection.findOneAndUpdate(
        { creatorIP: creatorIP },
        { $inc: { messages: 1 } },
        { upsert: true, returnOriginal: false }
      );
  
      // close the connection to the database
      client.close();
    } catch (err) {
      console.log(err);
    }
  }
  