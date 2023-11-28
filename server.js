// server.js
const express = require('express');
const mongoose = require('mongoose');
const { Topper, MainsAnswer } = require('./models/index');
const bodyParser = require('body-parser')




const app = express();

// middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// database connection
mongoose.connect(`mongodb+srv://ngawangg:applepie@cluster0.7h0rl9g.mongodb.net/ias?retryWrites=true&w=majority` ,);


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


// comming from admin.ejs this is used to add mains questions and answer in mongoDB database the schema is in models
app.post('/add-mains-answer', async (req, res) => {
  try {
    const newMainsAnswer = new MainsAnswer(req.body);
    await newMainsAnswer.save();
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
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
// app.get('/user/:topicName', async (req, res) => {
//   try {
//     const topicName = req.params.topicName;
//     const mainsAnswers = await MainsAnswer.find({ TopicName: topicName });
//     res.render('user', { topicName, mainsAnswers });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });



// get details of topper copy
// app.get('/toppers-copy/:topperName', async (req, res) => {
//   try {
//     const topperName = req.params.topperName;
//     console.log('Querying for WrittenBy:', topperName);

//     const mainsAnswers = await MainsAnswer.find({ WrittenBy: topperName });
//     console.log('Found Mains Answers:', mainsAnswers);

//     res.json(mainsAnswers); // Sending the response as JSON for better handling
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

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




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
