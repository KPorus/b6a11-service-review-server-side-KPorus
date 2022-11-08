const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// fun part
app.use((req, res, next) => {
    console.log(req.path, "I am watching you.")
    next();
})

// middle wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1rqmivg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const workCollection = client.db('photographer').collection('work');
        const homeCollection = client.db('photographer').collection('home-part-service');
        // work data load
        app.get('/work', async (req, res) => {
            const query = {}
            const cursor = workCollection.find(query);
            const work = await cursor.toArray();
            res.send(work);
        });

        app.get('/', async (req, res) => {
            const query = {}
            const cursor = homeCollection.find(query);
            const home = await cursor.toArray();
            res.send(home);
        })


    }
    finally {

    }

}

run().catch(err => console.error(err));


app.listen(port, (req, res) => {
    console.log(` server running on ${port}`);
})