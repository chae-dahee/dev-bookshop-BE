const express = require("express");
const app = express();
const cors = require("cors"); // cors 패키지를 import

const dotenv = require("dotenv");
dotenv.config();

app.listen(process.env.PORT);

// CORS 설정
app.use(
  cors({
    origin: "http://localhost:3000", // 프론트엔드 URL을 여기에 설정
    credentials: true, // 쿠키 허용
  })
);

// 미들웨어 설정 (예: JSON 파싱)
app.use(express.json());

const userRouter = require("./router/users");
const bookRouter = require("./router/books");
const categoryRouter = require("./router/category");
const likeRouter = require("./router/likes");
const cartRouter = require("./router/carts");
const orderRouter = require("./router/orders");

app.use("/users", userRouter);
app.use("/books", bookRouter);
app.use("/category", categoryRouter);
app.use("/likes", likeRouter);
app.use("/carts", cartRouter);
app.use("/orders", orderRouter);
