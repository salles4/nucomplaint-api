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
app.post("/api/sentiment", (req, res) => {
  const text = req.body.text;
  if (!text){
    res.status(400).json({error: "Missing body"})
    return;
  }
  getSentiment(text).then(response => {
    res.json(response)
    console.log(response);
  }).catch(error => {
    console.error(error);
    res.status(500).json({error: "Error: " + error})
    
  })
})

app.post("/api/complaint_report", (req, res) => {
  const complaintData = req.body.complaintData;
  if (!complaintData) {
    res.status(400).json({ error: "Missing body" })
    return;
  }
  generate(complaintData).then(response => {
    res.json({
      message: response
    })
  }).catch(error => {
    console.error(error);
    res.status(500).json({ error: "Error: " + error })

  })
})

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generate(complaintData){
  const context = "This is a web-based complaint management system of an university. Provide  suggestions how to address the most reported complaint category. Response should not include the data just suggestion. The format of data are: category and report frequency is separated with colon and each category is separated by comma. Here are the data "
  const sampledata = "Theft:2, Academic Dishonesty:8, Improper dresscode:21, Loitering:1, Fighting:1.";
  
  const result = await model.generateContent(context + complaintData);
  console.log(result);
  console.log(result.response.text());
  return result.response.text();
}

class MyClassificationPipeline {
  static task = 'text-classification';
  static model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      // Dynamically import the Transformers.js library
      let { pipeline } = await import('@huggingface/transformers');

      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

async function getSentiment(text) {
  const classifier = await MyClassificationPipeline.getInstance();
  response = await classifier(text);
  return response
}