const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");

const connectDB = require("./config/db");
connectDB();

// Cors
const corsOptions = {
	origin: process.env.ALLOWED_CLIENTS.split(","),
};
app.use(cors(corsOptions));

app.use(express.static("public"));
app.use(express.json());

// Template engine
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

// Routes
app.use("/api/files", require("./routes/files"));
app.use("/files", require("./routes/show"));
app.use("/files/download", require("./routes/download"));

// Root
app.get("/", (request, response) => {
	response.sendFile(__dirname + "/index.html");
});

app.listen(process.env.PORT || 3000, () => {
	console.log("Listening on PORT", process.env.PORT || 3000);
});
