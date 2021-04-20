const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
const MongoClient = require("mongodb").MongoClient;
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tvsz3.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const eventCollection = client.db("event-planning").collection("events");
  const testimonialCollection = client.db("event-planning").collection("testimonial");
  const ordersCollection = client.db("event-planning").collection("orders");
  const adminCollection = client.db("event-planning").collection("admins");

  app.post("/addService", (req, res) => {
    const newService = req.body;
    eventCollection.insertOne(newService).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addTestimonial", (req, res) => {
    const newTestimonial = req.body;
    testimonialCollection.insertOne(newTestimonial).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/events", (req, res) => {
    eventCollection.find({}).toArray((err, items) => {
      
      res.send(items);
    });
  });

  app.get("/testimonials", (req, res) => {
    testimonialCollection.find({}).toArray((err, items) => {
     
      res.send(items);
    });
  });

  app.get('/singleService/:id', (req, res) => {
    eventCollection.find({ _id: ObjectId(req.params.id)})
    .toArray((err, item) => {
      res.send(item[0])
    })
  })

  app.post('/addOrder', (req, res) => {
    const newOrder = req.body;
    console.log(newOrder);
    ordersCollection.insertOne(newOrder)
    .then(result => {
        console.log(result)
        res.send (result.insertedCount > 0)
    })
})

app.get('/showOrder', (req,res)=>{
  ordersCollection.find({email: req.query.email})
  .toArray((err, documents) => {
    console.log(documents)
      res.send(documents)
  })
})
//book order  list


app.get ('/allOrderList', (req,res)=>{
  ordersCollection.find({})
  .toArray((err, orderList)=> {
    res.send(orderList)
  })
})

//update Status
app.patch('/updateOrderStatus', (req, res) => {
  
  ordersCollection.updateOne({ _id: ObjectId(req.body.id) }, {
      $set: { status: req.body.status }
  })
      .then(result => {
        console.log(result.modifiedCount);
          res.send(result.modifiedCount > 0)
      })
})


//add admin
app.post('/makeAdmin',(req, res) => {
  const adminEmail = req.body;
  adminCollection.insertOne(adminEmail).then((result) => {
    res.send(result.insertedCount > 0);
  })
});


app.post("/isAdmin", (req, res) => {
  const email = req.body.email;
  adminCollection.find({ email: email }).toArray((err, admins) => {
    res.send(admins.length > 0);
  });
});

app.delete("/delete/:id", (req, res) => {
  ordersCollection.findOneAndDelete({ _id: ObjectId(req.params.id) })
    .then((result) => {
      res.send(result.deletedCount > 0);
    });
});

});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
