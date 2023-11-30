// server.js
const express = require('express');
const mongoose = require('mongoose');
const { Topper, MainsAnswer } = require('./models/index');
const bodyParser = require('body-parser')
const multer = require('multer'); // Add this line
const sanitizeFilename = require('sanitize-filename');
const app = express();
const path = require('path');
const Grid = require('gridfs-stream');
const fs = require('fs');


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('uploads'));


// database connection
mongoose.connect(`mongodb+srv://ngawangg:applepie@cluster0.7h0rl9g.mongodb.net/ias?retryWrites=true&w=majority` ,);

const conn = mongoose.connection;
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('mainsanswers');
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
]);



// Admin side routes
app.get('/admin', (req, res) => {
  res.render('admin');
});


// A route to get the login page
app.get('/login' , (req,res)=>{
    res.render('login');
})

// get the home page with the list of all toppers
app.get('/', async (req, res) => {
  try {
    // Fetch all toppers from the database
    const allToppers = await Topper.find({});
    res.render('home', { allToppers });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// this is to check the login route
app.post('/check',(req,res)=>{
    const password = req.body.password;
    const email = req.body.email;
    if(password === "ngawang" && email === "ngawanglm07@gmail.com"){
        res.render('admin')
    } else {
        res.render('login')
    }
})

// comming from admin.ejs this is used to add toppers in mongoDB database the schema is in models
app.post('/add-topper', async (req, res) => {
  try {
    const newTopper = new Topper(req.body);
    await newTopper.save();
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/add-mains-answer', upload, async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);

    if (!req.files) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { TestCode, QuestionNumber, QuestionText, AnswerText, WrittenBy, Paper, TopicName, SubtopicName } = req.body;

    const images = [];
    for (let i = 1; i <= 3; i++) {
      const key = `image${i}`;
      if (req.files[key]) {
        images.push({
          imageUrl: req.files[key][0].originalname,  // Using originalname here
          description: req.body[`${key}Description`],
        });
      }
    }

    const mainsAnswer = new MainsAnswer({
      TestCode,
      QuestionNumber,
      QuestionText,
      AnswerText,
      AnswerImages: images,
      WrittenBy,
      Paper,
      TopicName,
      SubtopicName,
    });

    const savedMainsAnswer = await mainsAnswer.save();
    
    res.redirect('/admin')
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/search', async (req, res) => {
  try {
    const searchQuery = req.query.search;
    console.log('Search Query:', searchQuery); // Add this line to log the search query

    // Fetch mains answers based on the search query
    const searchResults = await MainsAnswer.find({
      $or: [
        { Paper: { $regex: new RegExp(searchQuery, 'i') } },
        { TopicName: { $regex: new RegExp(searchQuery, 'i') } },
        { SubtopicName: { $regex: new RegExp(searchQuery, 'i') } }
      ]
    });

    res.render('results', { searchResults, searchQuery });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// get the question and answer  uploaded by a particular topper 
app.get('/upsc-topper/:topperName', async (req, res) => {

  try {
    const providedName = req.params.topperName;
    const formattedName = providedName.replace(/\s/g, '').toLowerCase();
    const topperData = await Topper.findOne({ Name: new RegExp('^' + formattedName, 'i') });
    if (topperData) {
      // Fetch mains answers for the topper using topperName, not topperData.Name
      topperData.mainsAnswers = await MainsAnswer.find({ WrittenBy: providedName });
    }
    res.render('details', { topperData });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// User side routes
app.get('/user/:topicName', async (req, res) => {
  try {
    const topicName = req.params.topicName;
    const mainsAnswers = await MainsAnswer.find({ TopicName: topicName });
    res.render('user', { topicName, mainsAnswers });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// get details of topper copy
app.get('/toppers-copy/:topperName', async (req, res) => {
  try {
    const topperName = req.params.topperName;
    console.log('Querying for WrittenBy:', topperName);

    const mainsAnswers = await MainsAnswer.find({ WrittenBy: topperName });
    console.log('Found Mains Answers:', mainsAnswers);

    res.json(mainsAnswers); // Sending the response as JSON for better handling
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Add this route to fetch all topper names
app.get('/topper-names', async (req, res) => {
  try {
    // Fetch all topper names from the database
    const allTopperNames = await Topper.find({}, 'Name');
    res.json(allTopperNames);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/topic' , async(req,res)=>{
  try{
  const allTopics = await MainsAnswer.find({} , 'TopicName');
  res.json(allTopics)
  } catch {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
})


app.get('/subject' , async(req,res)=>{
  try{
  const allSubject = await MainsAnswer.find({} , 'Paper');
  res.json(allSubject)
  } catch {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
})

// Add this route to fetch subtopics based on the selected paper and topic
app.get('/subtopic', async (req, res) => {
  try {
    const paperQuery = req.query.paper;
    const topicQuery = req.query.topic;

    // Fetch subtopics based on the provided paper and topic
    const subtopics = await MainsAnswer.find({
      Paper: { $regex: new RegExp(paperQuery, 'i') },
      TopicName: { $regex: new RegExp(topicQuery, 'i') }
    }, 'SubtopicName');

    res.json(subtopics);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/uploads/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    console.log('Requested Filename:', filename);

   
    // Change this line to the correct path

const directoryContents = fs.readdirSync(path.join(__dirname, 'uploads'), 'utf8').map(file => file.toLowerCase());

    console.log('Uploads Directory Contents:', directoryContents);

    const file = await gfs.files.findOne({ filename });
    console.log('Found File:', file);

    if (!file) {
      return res.status(404).send('File not found');
    }

    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});







const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
