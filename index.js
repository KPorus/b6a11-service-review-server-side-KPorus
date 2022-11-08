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


async function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try {
        const workCollection = client.db('photographer').collection('work');
        const homeCollection = client.db('photographer').collection('home-part-service');
        const serviceCollection = client.db('photographer').collection('services');
        const orderCollection = client.db('photographer').collection('orders');
        const reviewCollection = client.db('photographer').collection('userReviews');

        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
            res.send({token})
        })  


        app.get("/",(req,res)=>
        {
            res.send("I am watching. caught you")
        })
        // work data load
        app.get('/work', async (req, res) => {
            const query = {}
            const cursor =await workCollection.find(query);
            const work = await cursor.toArray();
            res.send(work);
        });
        // home service part
        app.get('/homeService', async (req, res) => {
            const query = {}
            const cursor = await homeCollection.find(query);
            const home = await cursor.toArray();
            res.send(home);
        })
        
        // checkOut part
        app.get('/homeService/:id',async(req,res)=>
        {
            const id = req.params.id;
            console.log(req.params.id)
            const query = {_id:ObjectId(id)}
            const checkOut = await homeCollection.findOne(query);
            console.log(checkOut)
            res.send(checkOut);
        })
        // order post
        app.post('/orders',async(req,res)=>
        {
            const order = req.body;
            console.log(order)
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

        // order get 
        app.get('/orders', verifyJWT,async (req, res) => {
            const decoded = req.decoded;
            
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // order delete
        app.delete('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })

        // services
        app.get('/services', verifyJWT,async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/services/:id',async(req,res)=>
        {
            const id = req.params.id;
            console.log(req.params.id)
            const query = {_id:ObjectId(id)}
            console.log(query)
            const serviceCheckout = await serviceCollection.findOne(query);
            console.log(serviceCheckout)
            res.send(serviceCheckout);
        })

     
    }
    finally {

    }

}

run().catch(err => console.error(err));


app.listen(port, (req, res) => {
    console.log(` server running on ${port}`);
})