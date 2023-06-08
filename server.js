const express = require("express");
const dbConnect = require("./database/index");
const { PORT } = require("./config/index");
const router = require("./router/index");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const corsOptions = {
  credentials: true,
  origin: ["http://localhost:3000"],
};

const app = express();

app.listen(PORT, console.log(`Backend is running on ${PORT}`));
app.use(cookieParser());

app.use(cors(corsOptions));

dbConnect();
app.use(express.json());

app.use(router);

app.use(errorHandler);
