const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const uri = process.env.DB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const app = express();
const port = 8000; // Change the port to 8000

// Middleware to parse JSON
app.use(bodyParser.json());

// Define a Mongoose schema and model
const webhookSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, match: /.+\@.+\..+/ },
    number: { type: String, required: true },
    city: { type: String, required: true }
}, { timestamps: true });

const Webhook = mongoose.model('Webhook', webhookSchema);

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

// Define a route to handle webhook POST requests
app.post('/webhook', async (req, res) => {
    try {
        const { name, email, number, city } = req.body; // Destructure data from req.body

        const webhookData = new Webhook({ name, email, number, city });

        await webhookData.save();

        res.status(200).send('Webhook data saved successfully');
    } catch (error) {
        console.error('Error saving webhook data:', error);
        res.status(500).send('Error saving webhook data');
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
