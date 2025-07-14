const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRouter = require("./routers/authRoutes");
const bookingRouter = require("./routers/bookingRoutes");
const scheduleRouter = require("./routers/scheduleRoutes");
const businessRouter = require("./routers/businessRoutes");
const contactRouter = require("./routers/contactRoutes");
const verificationCodeRouter = require("./routers/verificationCodeRoutes");
const serviceRouter = require("./routers/serviceRoutes");
const practitionerRouter = require("./routers/practitionerRoutes");
const weeklyScheduleRouter = require("./routers/weeklyScheduleRoutes");
dotenv.config();

app.use(cors());
app.use(helmet());
app.use(cookieParser()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URL;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    require("./Automate/triggerFunc.js");

  }).catch((err) => {
    console.log(err);
  });

app.use("/api/auth", authRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/business", businessRouter);
app.use("/api/contact", contactRouter);
app.use("/api/verification-code", verificationCodeRouter);
app.use("/api/service", serviceRouter);
app.use("/api/practitioner", practitionerRouter);
app.use("/api/weekly-schedule", weeklyScheduleRouter);

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});

// MONGO_URL="mongodb://localhost:27017/Bookify"
