require('dotenv').config(); // Load environment variables from .env file
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const express = require('express');
const {Configuration, OpenAIApi} = require('openai');
const app = express();
const port = process.env.port

// Rate limit configuration
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  max: 10, // Max number of requests per hour
  message: "Rate limit exceed Too many requests from this IP, please try again 1 hour.",
});

app.use(limiter);
// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize the OpenAI API client
const config = new Configuration({
  apiKey : process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(config);

app.post('/convert', async (req, res) => {
  const { code, language } = req.body;
console.log(code)
  try {
    // Prepare the prompt for code conversion
    const prompt = `Convert the following code to ${language} :\n\n${code}`;

    // Make a request to the OpenAI API for code conversion
    const messages = [
      {role : 'system', content : prompt},
      {role : 'user', content : code }
    ];

    const response = await openai.createChatCompletion({
      model : "gpt-3.5-turbo",
      messages : messages,
      max_tokens : 100
    });

    const convertedCode = response.data.choices[0].message.content;
    res.json({ convertedCode });

  } catch (error) {
    console.error('Error converting code:', error);
    res.status(500).json({ error: 'Failed to convert the code.' });
  }
});


// debug route;

app.post('/debug', async (req, res) => {
  const { code } = req.body;

  try {
    // Prepare the prompt for code debugging
    const prompt = `Debug the following code:\n\n${code}`;

    // Make a request to the OpenAI API for code debugging
    const messages = [
      {role : 'system', content : prompt},
      {role : 'user', content : code }
    ];

    const response = await openai.createChatCompletion({
      model : "gpt-3.5-turbo",
      messages : messages,
      max_tokens : 200
    });

    // Extract the debug result from the response
    const debugResult = response.data.choices[0].message.content;

    res.json({ debugResult });

  } catch (error) {
    console.error('Error debugging code:', error);
    res.status(500).json({ error: 'Failed to debug the code.' });
  }
});


app.post('/qualitycheck', async (req, res) => {
  const { code } = req.body;

  try {
    // Prepare the prompt for code quality check
    const prompt = `Check the quality of the following code for example check if the code follow good coding practices and it has proper spaces and suggest that how it should be :\n\n${code}`;

    // Make a request to the OpenAI API for code quality check

    const messages = [
      {role : 'system', content : prompt},
      {role : 'user', content : code }
    ];


    const response = await openai.createChatCompletion({
      model : "gpt-3.5-turbo",
      messages : messages,
      max_tokens : 200
    });

    // Extract the quality check result from the response
    const qualityCheckResult = response.data.choices[0].message.content;

    console.log(qualityCheckResult);

    res.json({ qualityCheckResult });
  } catch (error) {
    console.error('Error checking code quality:', error);
    res.status(500).json({ error: 'Failed to check the code quality.' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});