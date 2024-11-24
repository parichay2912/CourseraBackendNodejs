const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb+srv://parichay23054:12345@coursera.ikbj8.mongodb.net/?retryWrites=true&w=majority&appName=Coursera"; // Replace with your MongoDB URI
const dbName = "your_database_name";
const collectionName = "your_collection_name";

let db, collection;

// Connect to MongoDB and initialize the database and collection
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((client) => {
        console.log("Connected to MongoDB!");
        db = client.db(dbName);
        collection = db.collection(collectionName);
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
    });

// Middleware to parse JSON request bodies
app.use(express.json());

app.get("/query", async (req, res) => {
    const { field, value } = req.query;

    if (!field || !value) {
        return res.status(400).send("Please provide both 'field' and 'value' query parameters.");
    }

    try {
        // Use a regular expression to match documents where the field contains the value
        const query = { [field]: { $regex: value, $options: "i" } }; // $options: "i" makes it case-insensitive
        const results = await collection.find(query).toArray();

        if (results.length > 0) {
            res.status(200).json({ message: "Documents found:", data: results });
        } else {
            res.status(404).json({ message: "No documents match the query." });
        }
    } catch (err) {
        console.error("Error querying MongoDB:", err);
        res.status(500).send("Internal server error.");
    }
});


// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
