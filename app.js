require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

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
    const query = { [field]: { $regex: value, $options: 'i' } };
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

// Add a new document
app.post('/add', async (req, res) => {
  const {
    partner,
    course,
    skills,
    rating,
    reviewcount,
    level,
    certificatetype,
    duration,
    crediteligibility,
    course_id,
    money,
    cost_of_course,
    current_discount,
    final_amount,
  } = req.body;

  if (!partner || !course || !course_id || !skills || !rating || !reviewcount) {
    return res.status(400).json({
      message:
        'Missing required fields. Ensure fields like partner, course, skills, course_id, rating, and reviewcount are included.',
    });
  }

  try {
    const newDocument = {
      partner,
      course,
      skills,
      rating: parseFloat(rating),
      reviewcount,
      level: level || '',
      certificatetype: certificatetype || '',
      duration: duration || '',
      crediteligibility: crediteligibility || false,
      course_id,
      money: money || '',
      cost_of_course: parseFloat(cost_of_course) || 0,
      current_discount: parseFloat(current_discount) || 0,
      final_amount: parseFloat(final_amount) || 0,
    };

    const result = await collection.insertOne(newDocument);
    res.status(201).json({
      message: 'Document added successfully!',
      documentId: result.insertedId,
    });
  } catch (err) {
    console.error('Error adding document:', err);
    res.status(500).send('Internal server error.');
  }
});

// Delete a document by ID
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send('Document ID is required for deletion.');
  }

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Document deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Document not found.' });
    }
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).send('Internal server error.');
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
