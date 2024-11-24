require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();

// Use environment variables for sensitive information
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;
const port = process.env.PORT || 3000;

let db, collection;

// Connect to MongoDB and initialize the database and collection
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    console.log('Connected to MongoDB!');
    db = client.db(dbName);
    collection = db.collection(collectionName);
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });

// Middleware
app.use(express.json());

// Add CORS middleware
app.use(cors());

// Query endpoint
app.get('/query', async (req, res) => {
  const { field, value } = req.query;

  if (!field || !value) {
    return res
      .status(400)
      .send("Please provide both 'field' and 'value' query parameters.");
  }

  try {
    // Use a regular expression to match documents where the field contains the value
    const query = { [field]: { $regex: value, $options: 'i' } }; // $options: "i" makes it case-insensitive
    const results = await collection.find(query).toArray();

    if (results.length > 0) {
      res.status(200).json({ message: 'Documents found:', data: results });
    } else {
      res.status(404).json({ message: 'No documents match the query.' });
    }
  } catch (err) {
    console.error('Error querying MongoDB:', err);
    res.status(500).send('Internal server error.');
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
