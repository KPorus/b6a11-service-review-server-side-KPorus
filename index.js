const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();



const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1rqmivg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const workCollection = client.db('photographer').collection('work');

        app.get('/work', async (req, res) => {
            const query = {}
            const cursor = workCollection.find(query);
            const work = await cursor.toArray();
            res.send(work);
        });

        app.use((req, res, next) => {
            console.log(req.path, "I am watching you.")
            next();
        })

        app.get('/', (req, res) => {
            res.send(' server is running')
        })


    }
    finally {

    }

}

run().catch(err => console.error(err));


app.listen(port, (req, res) => {
    console.log(` server running on ${port}`);
})