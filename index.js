const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId, CURSOR_FLAGS } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// fun part
app.use((req, res, next) => {
    console.log(req.path, "I am watching you.")
    next();
})

// middle wares
const corsOptions ={
    origin:'*', 
    credentials:true,    
    optionSuccessStatus:200,
 }
 
 app.use(cors(corsOptions))
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1rqmivg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    console.log(authHeader)
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
        const serviceCollection = client.db('photographer').collection('services');
        const orderCollection = client.db('photographer').collection('orders');
        const myReviewCollection = client.db('photographer').collection('myReview');

        app.post('/jwt', (req, res) =>{
            const user = req.body;
            console.log(user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '14d'})
            res.send({token})
        })  


        app.get("/",(req,res)=>
        {
            res.send("I am watching. caught you")
        })
        // work data load
        app.get('/work', async (req, res) => {
            const query = {}
            const cursor = workCollection.find(query);
            const work = await cursor.toArray();
            res.send(work);
        });
        // home service part
        app.get('/homeServices', async (req, res) => {
            const query = {}
            const cursor =  serviceCollection.find(query);
            const home = await cursor.limit(3).toArray();
            res.send(home);
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
        app.get('/orders',verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if(decoded.email !== req.query.email){
                return res.status(403).send({message: 'unauthorized access'})
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
        app.get('/services',async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        // checkOut && userReview
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

        app.post('/userReviews',async(req,res)=>
        {
            const userReview = req.body;
            console.log(userReview)
             const review = await myReviewCollection.insertOne(userReview);
            console.log(review)
            res.send(review);
        })

        app.get('/userReviews',async(req,res)=>
        {
            const query = {}
             const cursor = myReviewCollection.find(query);
             const review = await cursor.toArray();
            console.log(review)
            res.send(review);
        })

        app.get('/service/reviews/:serviceName',async(req,res)=>
        {
            const title = req.params.serviceName
            console.log(title)
            const query = {ServiceName: title}
            const result = await myReviewCollection.find(query).toArray();
            if(result.length === 1)
            {
                let review = result
                res.send(review);
            }
            else{
                res.send(result)
            }
        })

        app.delete('/userReviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await myReviewCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally {

    }

}

run().catch(err => console.error(err));


app.listen(port, (req, res) => {
    console.log(` server running on ${port}`);
})