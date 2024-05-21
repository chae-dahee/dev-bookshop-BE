const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

app.listen(process.env.PORT);

const userRouter = require("./router/users");
const bookRouter = require("./router/books");
const likeRouter = require("./router/likes");
const cartRouter = require("./router/carts");
const orderRouter = require("./router/orders");

app.use("/users", userRouter);
app.use("/books", bookRouter);
app.use("/likes", likeRouter);
app.use("/carts", cartRouter);
app.use("/orders", orderRouter);
