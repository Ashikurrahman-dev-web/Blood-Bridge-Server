const dns = require('node:dns');
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express =  require('express');
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb'); 
const { create } = require('node:domain');
const uri = process.env.MONGODB_URI;
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
  // await client.connect();
  const requestCollection = client.db('blood').collection("requests");
  const userCollection = client.db('blood').collection('user')
 const messageCollection = client.db('blood').collection('message')
 const commentCollection = client.db('blood').collection('comment')
app.post("/api/comment", async(req,res)=>{
const data =req.body;
const result = await commentCollection.insertOne(data);
res.json(result)
}); 
app.get("/api/comment/admin", async(req,res)=>{
const result = await commentCollection.find().toArray()
res.send(result)
});
app.patch("/api/comment/:id", async(req,res)=>{
const result = await commentCollection.updateOne({_id: new ObjectId(req.params.id)},
{$set: req.body});
res.send(result);
});
app.delete("/api/comment/:id", async(req,res)=>{
const result = await commentCollection.deleteOne({_id: new ObjectId(req.params.id)});
res.send(result);
});
app.post("/api/message", async(req,res)=>{
const data =req.body;
const result = await messageCollection.insertOne(data);
res.json(result)
});
app.get("/api/message/admin", async(req,res)=>{
const result = await messageCollection.find().toArray()
res.send(result)
});
app.delete("/api/message/admin/:id", async(req,res)=>{
const result = await messageCollection.deleteOne({_id: new ObjectId(req.params.id)});
res.send(result);
});
app.get("/user/:email", async(req,res)=>{
try{
  const email = req.params.email;
const user = await userCollection.findOne({email});
res.send(user);
}catch(error){
res.status(500).send({
  success: false,
  message: getErrorMessage(error),
})
}
});
app.patch("/user/:email", async(req,res)=>{
try{
const result = await userCollection.updateOne({email: req.params.email},
  {
    $set:req.body,
  }
);
console.log(result);
return res.status(200).json({
  success: true,
  modifiedCount: result.modifiedCount,
})
}catch (error) {
        console.log(error);

        return res.status(500).json({
          success: false,
          message: getErrorMessage(error),
        });
      }
}); 
 app.post("/api/donation-requests", async(req,res)=>{
try{
const {
  requesterName,
    requesterEmail,
    requesterDistrict,
    requesterUpazila,
    requesterBloodGroup,
    fullAddress,
    requestMessage,
} = req.body
const newRequest = {
      requesterName,
      requesterEmail,
      requesterDistrict,
      requesterUpazila,
      fullAddress,
      requesterBloodGroup,
      requestMessage,
      donationStatus: "pending",
      createdAt: new Date(),
    };
 const result = await requestCollection.insertOne(newRequest);
 res.status(201).send({
      success: true,
      message: "Donation request created successfully",
      insertedId: result.insertedId,
    });  
}catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
 });
 app.get("/api/my-donation-requests", async(req,res)=>{
const {email, status, page} =req.query;
const query = {requesterEmail: email};
if(status && status !== "all"){
  query.donationStatus = status;
};
const limit = 5;
const pageNumber = parseInt(page);
const totalData = await requestCollection.countDocuments(query);
const totalPage = Math.ceil(totalData / limit);
const skip = (parseInt(pageNumber) - 1) * parseInt(limit)
const requests = await requestCollection
.find(query)
.sort({createdAt:-1})
.skip(skip)
.limit(parseInt(limit))
.toArray()
res.send({totalPage, skip, pageNumber, requests});
 });
 app.delete("/api/donation-request/:id", async(req,res)=>{
const {id} = req.params;
const result = await requestCollection.deleteOne({_id: new ObjectId(id)});
res.send(result);
 });
app.get("/api/donation-request/:id", async (req, res) => {
      try {
        const result = await requestCollection.findOne({
          _id: new ObjectId(req.params.id),
        });

        res.send(result);
      } catch (error) {
        res.status(500).send(error);
      }
    });
app.patch("/api/donation-request/:id", async(req,res)=>{
const result = await requestCollection.updateOne({_id: new ObjectId(req.params.id)},
{$set: req.body});
res.send(result);
});
app.get("/api/all-blood-donation-requests",async(req,res)=>{
const {status, page=1 ,limit=5} = req.query;
const query = {};
if(status && status !== "all"){
  query.donationStatus = status;
};
const totalData = await requestCollection.countDocuments(query);
const requests = await requestCollection.find(query)
.sort({createdAt:-1})
.skip((parseInt(page)-1)* parseInt(limit))
.limit(parseInt(limit))
.toArray();
res.send({totalPage: Math.ceil(totalData/parseInt(limit)), 
  requests, totalData});
});
app.patch("/api/donation-request/status/:id", async(req,res)=>{
const {status} = req.body;
const result = await requestCollection.updateOne({_id: new ObjectId(req.params.id)},
{$set: {donationStatus: status}});
res.send(result);
});
app.get("/api/public-donation-requests", async(req,res)=>{
  const {blood,district,upazila} = req.query;
  const query = {donationStatus: "approved"};
  if(blood && blood !== "all"){
query.bloodGroup = blood;
  };
if(district && district !== "all"){
query.recipientDistrict = district;
};
if(upazila && upazila !== "all"){
 query.recipientUpazila = upazila; 
}  
const request = await requestCollection.find(query)
.sort({createdAt:-1})
.toArray();
res.send(request);
});
app.get("/api/users", async(req,res)=>{
  const {status,roleVisitor} = req.query;
  const query ={};
 if(status && status !== "all"){
  query.status = status;
 };
 if(roleVisitor && roleVisitor !== "all"){
query.role = roleVisitor;
 }
const users = await userCollection.find(query).toArray();
res.send(users);
});
app.patch("/api/users/status/:id", async(req,res)=>{
const {status} = req.body;
const result = await userCollection.updateOne({_id: new ObjectId(req.params.id)},
{$set: {status: status}});
res.send(result);
});
app.patch("/api/users/role/:id", async(req,res)=>{
const {role} = req.body;
const result = await userCollection.updateOne({_id: new ObjectId(req.params.id)},
{$set: {role: role}});
res.send(result);
});
app.patch("/api/booking/:id", async(req,res)=>{
const {patientName,patientEmail } = req.body
const result = await requestCollection.updateOne({_id: new ObjectId(req.params.id)},{
  $set:{
donationStatus: "booked",
patientName,patientEmail,
  },
});
res.send(result)
});  
app.get("/api/booking-donation",async(req,res)=>{
const {email} = req.query;
const query = {patientEmail: email, donationStatus:"booked"}
const bookingData = await requestCollection.find(query).toArray();
res.send(bookingData);
});
app.patch("/api/booking-donation/:id", async (req, res) => {
  const result = await requestCollection.updateOne(
    {
      _id: new ObjectId(req.params.id),
    },
    {
      $set: {
        donationStatus: "approved",
      },
      $unset: {
        patientEmail: "",
        patientName: "",
      },
    }
  );
 res.send(result);
});
app.patch("/api/booking-donation/done/:id", async(req,res)=>{
const result = await requestCollection.updateOne({_id: new ObjectId(req.params.id)},
{$set: {donationStatus: "done"}});
res.send(result);
})
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Server Running");
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 