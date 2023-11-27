// models/index.js
const mongoose = require('mongoose');

const topperSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Rank: {
    type: Number,
    required: true,
  },
  Year: {
    type: Number,
    required: true,
  },
  GS1Marks: {
    type: Number,
    required: true,
  },
  GS2Marks: {
    type: Number,
    required: true,
  },
  GS3Marks: {
    type: Number,
    required: true,
  },
  GS4Marks: {
    type: Number,
    required: true,
  },
  EssayMarks: {
    type: Number,
    required: true,
  },
  PrelimsScoreGS: {
    type: Number,
    required: true,
  },
  PrelimsScoreCSAT: {
    type: Number,
    required: true,
  },
  OptionalSubject: {
    type: String,
    required: true,
  },
  Optional1Marks: {
    type: Number,
    required: true,
  },
  Optional2Marks: {
    type: Number,
    required: true,
  },
  Remarks: {
    type: String,
    required: true,
  },
});

const mainsAnswerSchema = new mongoose.Schema({
  TestCode: {
    type: String,
    required: true,
  },
  QuestionNumber: {
    type: Number,
    required: true,
  },
  QuestionText: {
    type: String,
    required: true,
  },
  AnswerText: {
    type: String,
    required: true,
  },
  AnswerImages: [
    {
      imageUrl: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
    },
  ],
  WrittenBy: {
    type: String,
    required: true,
  },
  Paper: {
    type: String,
    required: true,
  },
  TopicName: {
    type: String,
    required: true,
  },
  SubtopicName: {
    type: String,
    required: true,
  },

});

const Topper = mongoose.model('Topper', topperSchema);
const MainsAnswer = mongoose.model('MainsAnswer', mainsAnswerSchema);

module.exports = { Topper, MainsAnswer };

