const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const ensureAuthorization = (req, res) => {
  try {
    let receivedJwt = req.headers["authorization"];
    console.log(receivedJwt);

    if (receivedJwt) {
      let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
      console.log(decodedJwt);
      return decodedJwt;
    } else {
      throw new ReferenceError("jwt must be provided");
    }
  } catch (err) {
    console.log(err.name);
    console.log(err.message);

    return err;
  }
};

module.exports = ensureAuthorization;

// const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");
// dotenv.config();

// // Access Token 발급 함수
// const generateAccessToken = (user) => {
//   return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: "15m",
//     issuer: "dah",
//   });
// };

// // Refresh Token 발급 함수
// const generateRefreshToken = (user) => {
//   return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
//     expiresIn: "7d",
//     issuer: "dah",
//   });
// };

// const ensureAuthorization = (req, res) => {
//   try {
//     let receivedJwt = req.headers["authorization"];
//     console.log(receivedJwt);

//     if (receivedJwt) {
//       let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
//       console.log(decodedJwt);
//       return decodedJwt;
//     } else throw new ReferenceError("Access Token must be provided");
//   } catch (err) {
//     console.log(err.name);
//     console.log(err.message);

//     return err;
//   }
// };

// const refreshToken = (req, res) => {
//   try {
//     let receivedJwt = req.headers["authorization"];
//     if (!receivedJwt) throw new ReferenceError("Refresh token must be provided");

//     receivedJwt = receivedJwt.split(" ")[1]; // Bearer 스키마 제거
//     jwt.verify(receivedJwt, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
//       if (err) throw new Error("Invalid refresh token");

//       const accessToken = generateAccessToken({ id: user.id, email: user.email });
//       const newRefreshToken = generateRefreshToken({ id: user.id });

//       // 새로운 Access Token과 Refresh Token을 클라이언트에게 응답으로 보냄
//       res.cookie("accessToken", accessToken, { httpOnly: true });
//       res.cookie("refreshToken", newRefreshToken, { httpOnly: true });
//       res.json({ accessToken, refreshToken: newRefreshToken });
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(401).json({ error: err.message });
//   }
// };

// module.exports = {generateAccessToken, generateRefreshToken, ensureAuthorization, refreshToken};
