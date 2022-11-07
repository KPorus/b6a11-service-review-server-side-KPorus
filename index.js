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


const uri = "mongodb+srv://Porus:<password>@cluster0.1rqmivg.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



app.use((req, res, next)=>
{
    console.log(req.path,"I am watching you.")
    next();
})

app.get('/', (req, res) => {
    res.send(' server is running')
})

app.listen(port, (req, res) => {
    console.log(` server running on ${port}`);
})