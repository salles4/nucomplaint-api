require("dotenv").config()

const express = require("express")
const cors = require('cors')

const app = express();
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.listen(8000, () => {
  console.log('Server running at http://localhost:8000');
  
})
app.get("/api/complaint_report", (req, res) => {
  const complaintData = req.body.complaintData;
  if(!complaintData){
    res.status(400).json({error: "Missing body"})
    return;
  }
  generate(complaintData).then(response => {
    res.json({
      message: response
    })
  }).catch(error => {
    console.error(error);
    res.status(500).json({error: "Error: " + error})
    
  })
})
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
async function generate(complaintData){
  const context = "This is a web-based complaint management system of an university. Provide short suggestions how to address the most reported complaint type in a school environment, suggest only if the amount is above 10. "
  
  const sampledata = "Theft:2, Academic Dishonesty:8, Improper dresscode:21, Loitering:1, Fighting:1.";
  
  const result = await model.generateContent(context + complaintData);
  console.log(result);
  console.log(result.response.text());
  return result.response.text();
}
