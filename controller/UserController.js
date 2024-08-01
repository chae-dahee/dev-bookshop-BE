const conn = require("../mariadb"); // db 모듈
const { StatusCodes } = require("http-status-codes"); // status-code 모듈
const jwt = require("jsonwebtoken"); // jwt 모듈 - 로그인 관여
const crypto = require("crypto"); // crypto 모듈 - db의 암호화에 관여
const dotenv = require("dotenv"); // dotenv 모듈
dotenv.config();

const join = (req, res) => {
  const { email, password } = req.body;

  let sql = "INSERT INTO users (email, password, salt) VALUES (?, ?, ?)";

  //비밀번호 암호화
  const salt = crypto.randomBytes(10).toString("base64");
  const hashPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  let values = [email, hashPassword, salt];
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

    // salt값 꺼내서 날 것으로 들어온 비밀번호를 암호화 해보고
    const hashPassword = crypto
      .pbkdf2Sync(password, loginUser.salt, 10000, 10, "sha512")
      .toString("base64");

    // => DB 비밀번호와 비교
    if (loginUser && loginUser.password == hashPassword) {
      // 토큰 발행
      const token = jwt.sign(
        {
          id: loginUser.id,
          email: loginUser.email,
        },
        process.env.PRIVATE_KEY,
        {
          expiresIn: "1000000m",
          issuer: "songa",
        }
      );

      // 토큰 쿠키에 담기
      res.cookie("token", token, {
        httpOnly: true,
      });
      console.log(token); // 우리가 토큰이 잘 담긴걸 알기 위해서

      return res.status(StatusCodes.OK).json({ ...results[0], token: token });
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
    if (user) {
      return res.status(StatusCodes.OK).json({
        email: email,
        // json형태로 body값에서 받았던 email을 다시 돌려주기
      });
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
  });
};

const passwordReset = (req, res) => {
  const { email, password } = req.body;
  
  let sql = "UPDATE users SET password = ?, salt = ? WHERE email = ?";

  // 암호화된 비밀번호와 salt 값을 같이 DB에 저장
  const salt = crypto.randomBytes(10).toString("base64");
  const hashPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  let values = [hashPassword, salt, email];
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results.affectedRows == 0)
      // 이메일이 없을 경우
      return res.status(StatusCodes.BAD_REQUEST).end();
    // 이메일이 있을 경우
    else return res.status(StatusCodes.OK).json(results);
  });
};

module.exports = {
  join,
  login,
  passwordResetRequest,
  passwordReset,
};
