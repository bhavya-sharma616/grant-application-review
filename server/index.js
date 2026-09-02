require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require('mongoose');
const protect = require("./middleware/authMiddleware");
const allowRoles = require("./middleware/roleMiddleware");
const authRoutes = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const conflictRoutes = require("./routes/conflictRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const historyRoutes = require("./routes/historyRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const alertRoutes = require("./routes/alertRoutes");
const exportRoutes = require("./routes/exportRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get('/',(reqq,res)=>{
    res.json({message: "Grant Application Review API is running"});
});

app.use("/api/auth",authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/conflicts", conflictRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/export",exportRoutes);

// Any logged-in user can access this route
app.get("/api/test/protected", protect, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

// Only a Program Officer can access this route
app.get(
  "/api/test/officer-only",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  (req, res) => {
    res.json({
      message: "Welcome, Program Officer",
    });
  }
);

mongoose.connect(process.env.MONGO_URI)
        .then(()=>{
            console.log("Connected to MongoDB");

            app.listen(process.env.PORT || 5000, ()=>{
                console.log(`server running on port ${process.env.PORT || 5000}`);
            });
        })
        .catch((err)=>{
            console.log(`MongoDB connection error:`,err.message);
        })

