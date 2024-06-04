const conn = require("../mariadb"); //db module
const { StatusCodes } = require("http-status-codes"); //status codes module
const jwt = require("jsonwebtoken"); //jwt module
const crypto = require("crypto"); //crypto module : 암호화
const dotenv = require("dotenv"); //dotenv module
dotenv.config();

const join = (req, res) => {
  const { email, password } = req.body;

  let sql = "INSERT INTO users (email, password, salt) VALUES (?, ?, ?)";

  //비밀번호 암호화
  const salt = crypto.randomBytes(10).toString("base64");
  const hashPwd = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  let values = [email, hashPwd, salt]; //암호화된 pwd와 salt 값을 같이 DB에 저장
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    return res.status(StatusCodes.CREATED).json(results);
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  let sql = "SELECT * FROM users WHERE email = ?";
  conn.query(sql, email, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    const loginUser = results[0];

    //salt 값 꺼내서 날것으로 들어온 비밀번호를 암호화 해보고
    const hashPwd = crypto
      .pbkdf2Sync(password, loginUser.salt, 10000, 10, "sha512")
      .toString("base64");
    //DB 비밀번호랑 비교
    if (loginUser && loginUser.password == hashPwd) {
      //토근 발행
      const token = jwt.sign(
        {
          id: loginUser.id,
          email: loginUser.email,
        },
        process.env.PRIVATE_KEY,
        {
          expiresIn: "20m",
          issuer: "dah",
        }
      );

      //토큰 쿠키에 담기
      res.cookie("token", token, { httpOnly: true });
      console.log(token);
      return res.status(StatusCodes.OK).json(results);
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
  });
};

const passwordResetRequest = (req, res) => {
  const { email } = req.body;

  let sql = "SELECT * FROM users WHERE email = ?";
  conn.query(sql, email, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    //이메일로 유저가 있는지 찾아봄
    const user = results[0];
    if (user)
      return res.status(StatusCodes.OK).json({
        email: email,
      });
    else return results.status(StatusCodes.UNAUTHORIZED).end();
  });
};

const passwordReset = (req, res) => {
  const { email, password } = req.body;

  let sql = "UPDATE users SET password = ?, salt = ? WHERE email = ?";

  //비밀번호 암호화
  const salt = crypto.randomBytes(10).toString("base64");
  const hashPwd = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  let values = [hashPwd, salt, email];
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    if (results.affectedRows == 0)
      return res.status(StatusCodes.BAD_REQUEST).end();
    else return res.status(StatusCodes.OK).json(results);
  });
};

module.exports = { join, login, passwordResetRequest, passwordReset };
