const dns = require('node:dns');
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express =  require('express');
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb'); 
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
    recipientName,
    recipientDistrict,
    recipientUpazila,
    bloodGroup,
    hospitalName,
    fullAddress,
    requestMessage,
    donationDate,
    donationTime,
} = req.body
const newRequest = {
      requesterName,
      requesterEmail,
      recipientName,
      recipientDistrict,
      recipientUpazila,
      hospitalName,
      fullAddress,
      bloodGroup,
      donationDate,
      donationTime,
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