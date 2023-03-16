const express = require("express");
const app = express();
const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/posts");
const PORT = 3000;
const mongoose = require("mongoose");
require("dotenv").config();

//データベース接続
mongoose
  .connect(process.env.MONGOURL)
  .then(() => {
    console.log("DBと接続中。・・・");
  })
  .catch((err) => {
    console.log(err);
  });
//ミドルウェア
app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);

app.get("/", (req, res) => {
  res.send("hello express");
});

app.listen(PORT, () => console.log("サーバーが起動しました。"));
