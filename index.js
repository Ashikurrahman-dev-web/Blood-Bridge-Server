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