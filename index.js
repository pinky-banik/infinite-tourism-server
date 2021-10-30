const express = require('express');
require('dotenv').config()
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectID;


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('apartmentImage'));
app.use(fileUpload());

const port = process.env.port || 5000;

//Nihal mongoDB => user:apartmentHuntUser, pass: abcd1234, DB-Name: apartmentHunt;

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5f7tq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => { 
  console.log('db connected');
  const bookingCollection = client.db("infiniteTourism").collection("touristSpots");

  app.post('/addBooking', (req, res) => {
    const name = req.body.name;
    const number = req.body.number;
    const email = req.body.email;
    const message = req.body.message;
    const house = req.body.house;
    const price = req.body.price;
    const status = req.body.status;

    bookingCollection.insertOne({ name, number, email, message, house, price, status })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
      .catch(error => {
        console.log(error);
      });
  });

  app.get('/bookings', (req, res) => {
    bookingCollection.find({ email: req.query.email })
      .toArray((err, docs) => {
        res.send(docs)
      })
  });

  app.get('/allBookings', (req, res) => {
    bookingCollection.find({})
      .toArray((err, docs) => res.send(docs));
  });

  app.patch('/update/:id', (req, res) => {
    bookingCollection.updateOne({ _id: ObjectId(req.params.id) },
      {
        $set: { status: req.body.status }
      })
      .then(result => res.send(result.modifiedCount > 0))
  });

  const apartmentCollection = client.db("infiniteTourism").collection("services");

  app.post('/addNewApartment', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const price = req.body.price;
    const location = req.body.location;
    const bedroom = req.body.bedroom;
    const bathroom = req.body.bathroom;

    const newImg = file.data;
    const encImg = newImg.toString('base64');

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    apartmentCollection.insertOne({ title, price, location, bedroom, bathroom, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
      .catch(error => {
        console.log(error);
      });
  });

  app.get('/apartments', (req, res) => {
    apartmentCollection.find({})
      .toArray((err, docs) => res.send(docs));
  });

});


app.get('/', (req, res) => {
  res.send('Apartment Hunt Server')
});

app.listen(port,()=>{
 console.log('server is running on port');
});
// app.listen(process.env.PORT || port);