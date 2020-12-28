const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const fileUpload=require('express-fileupload');
const ObjectID = require("mongodb").ObjectID;
require('dotenv').config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ou6cn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true ,useUnifiedTopology:true });
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('teachersImage'));
app.use(fileUpload());
const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})



client.connect(err => {
  const classScheduleCollection = client.db("ChildsEducation").collection("ClassSchedule");
  const teachersCollection = client.db("teachersInfo").collection("teacher");
  const contactCollection = client.db("ConactInfo").collection("contact");
  const classCollection = client.db("ClassInformation").collection("AddClass");
  
  app.post('/addClassSchedule',function (req, res) {
          const classAppointment = req.body;
          console.log(classAppointment);
          classScheduleCollection.insertOne(classAppointment)
              .then(result => {
                  res.send(result.insertedCount > 0);

              });

      });
      app.post('/addContact',(req,res)=>
      {
         
    
          contactCollection.insertOne(req.body)
          .then(result => {
              res.send(result.insertedCount > 0);
          })
          .catch(err=>{})
    
          
      })

      
      app.get('/pendingContact',(req,res)=>
     {
    contactCollection.find({})
    .toArray((err, documents) => {

       // console.log((documents));
        res.send(documents);
    })   
  });
    
      
      
      app.post('/appointmentsByDate', (req, res)=>{
        const date=req.body;
        const email=req.body.email;
        teachersCollection.find({email:email})
        .toArray((err, teachers) => {
            const filter={date:date.date};
            if(teachers.length===0){
                   filter.email=email;
            }

        classScheduleCollection.find(filter)
        .toArray((err, documents) => {
          
            res.send(documents);
        })
          
        
        })
       
        

    });



    app.post('/addATeacher', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const subject = req.body.subject;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
        console.log(email);
        

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        teachersCollection.insertOne({name, email,subject,image})
            .then(result => {
                console.log(teachersCollection)
                res.send(result.insertedCount > 0);
            })
    });




    app.get('/teachers', (req, res) => {
        teachersCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
    

     app.post('/isTeacher', (req, res) => {
        const email = req.body.email;

        teachersCollection.find({ email: email })
            .toArray((err, teachers) => {
                res.send( teachers.length > 0);
            })
    })

    app.post('/addAClass', (req, res) => {
        
        const cass = req.body.class;
        const time = req.body.time;
        const space = req.body.space;
        classCollection.insertOne({cass, time,space})
            .then(result => {
                console.log(classCollection)
                res.send(result.insertedCount > 0);
            })
    });


    app.get('/classss', (req, res) => {
        classCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
    app.get('/teacherupdateget', (req, res) => {
        teachersCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
    

    app.patch('/TeacherUpdateProduct', (req, res) => {
        console.log(req.body.subject);
        
        teachersCollection.updateOne({ _id: ObjectID(req.body.paisi)},
            {
                $set: { subject: req.body.subject, name: req.body.name}
            })
            .then(result => {
                console.log(result);
                res.send(result.modifiedCount > 0);
            })
    })
    app.patch('/ClassUpdateProduct', (req, res) => {
        
        
        classScheduleCollection.updateOne({ _id: ObjectID(req.body._id)},
            {
                $set: { class: req.body.class, time: req.body.time,
                    space:req.body.space,
                
                }
            })
            .then(result => {
                console.log(result);
                res.send(result.modifiedCount > 0);
            })
    })
    app.delete('/teacherdelete/:paisi', (req, res) => {
        console.log(req.params.id);

        teachersCollection.deleteOne({ _id: ObjectID(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
    })



      console.log('Got it');
      
  });
  


app.listen(process.env.PORT || port)