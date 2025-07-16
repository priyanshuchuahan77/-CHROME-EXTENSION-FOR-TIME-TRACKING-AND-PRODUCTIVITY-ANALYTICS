const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/productivity", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const TimeSchema = new mongoose.Schema({
  domain: String,
  time: Number,
  date: { type: Date, default: Date.now }
});

const TimeEntry = mongoose.model("TimeEntry", TimeSchema);

// Endpoint to receive time data
app.post("/api/track", async (req, res) => {
  const { domain, time } = req.body;
  await TimeEntry.create({ domain, time });
  res.sendStatus(200);
});

// Endpoint for dashboard data
app.get("/api/stats", async (req, res) => {
  const data = await TimeEntry.aggregate([
    {
      $group: {
        _id: "$domain",
        totalTime: { $sum: "$time" }
      }
    }
  ]);
  res.json(data);
});

app.use('/dashboard', express.static('dashboard'));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
