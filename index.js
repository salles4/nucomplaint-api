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

app.post("/api/complaint_report", (req, res) => {
  const complaintData = req.body.dataContext;
  if (!complaintData) {
    res.status(400).json({ error: "Missing body" })
    return;
  }
  generateComplaintReport(complaintData).then(response => {
    res.json({
      message: response
    })
  }).catch(error => showError(error, res))
})
app.post("/api/offense_report", (req, res) => {
  const offenseData = req.body.dataContext;
  if (!offenseData) {
    res.status(400).json({ error: "Missing body" })
    return;
  }
  generateOffensesReport(offenseData).then(response => {
    res.json({
      message: response
    })
  }).catch(error => showError(error,res))
})

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateOffensesReport(offenseData){
  const context = "This is a web-based offenses management system of an university. Provide suggestions how to address the most violated offense category. Response should not include the data just suggestion. The format of data are: category and violation frequency is separated with colon and each category is separated by comma. Here are the data "

  const result = await model.generateContent(context + offenseData);
  console.log(result);
  console.log(result.response.text());
  return result.response.text();
}

async function generateComplaintReport(complaintData){
  const context = "This is a web-based complaint management system of an university. Provide  suggestions how to address the most reported complaint category. Response should not include the data just suggestion. The format of data are: category and report frequency is separated with colon and each category is separated by comma. Here are the data "
  const sampledata = "Theft:2, Academic Dishonesty:8, Improper dresscode:21, Loitering:1, Fighting:1.";
  
  const result = await model.generateContent(context + complaintData);
  console.log(result);
  console.log(result.response.text());
  return result.response.text();
}

const showError = (error, res) => {
  console.error(error);
  res.status(500).json({ error: "Error: " + error })
}