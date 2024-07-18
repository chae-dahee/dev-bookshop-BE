const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const ensureAuthorization = require("../auth");
const jwt = require("jsonwebtoken");

//(요약된)전체 도서 조회 + 카테고리별 조회 + 신간 여부
const allBooks = (req, res) => {
  let allBooksRes = {};

  let { category_id, news, limit, currentPage } = req.query;

  //lim,it : page 당 도서 수
  //currnetPage : 현재 몇 페이지
  //offset : 0부터 시작~ limit * (currnetPage-1)
  let offset = limit * (currentPage - 1);

  let sql = `SELECT  SQL_CALC_FOUND_ROWS *,
    (SELECT count(*) FROM Bookshop.likes WHERE liked_book_id = books.id) as likes
    FROM books`;
  let values = [];
  if (category_id && news) {
    sql +=
      " WHERE category_id=? and pub_date BETWEEN date_sub(now(), interval 6 month) AND now()";
    values = [category_id];
  } else if (category_id) {
    sql += " WHERE category_id = ?";
    values = [category_id];
  } else if (news) {
    sql +=
      " WHERE pub_date BETWEEN date_sub(now(), interval 6 month) AND now()";
  }
  sql += " LIMIT ? OFFSET ?";
  values.push(parseInt(limit), offset);

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      // return res.status(StatusCodes.BAD_REQUEST).end();
    }
    console.log(results);
    if (results.length) {
      results.map((res) => {
        res.pubDate = res.pub_date;
        delete res.pub_date;
      });
      allBooksRes.books = results;
    } else return res.status(StatusCodes.NOT_FOUND).end();
  });

  sql = "SELECT found_rows();";

  conn.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    let pagination = {};
    pagination.currentPage = parseInt(currentPage);
    pagination.totalCount = results[0]["found_rows()"];
    allBooksRes.pagination = pagination;
    return res.status(StatusCodes.OK).json(allBooksRes);
  });
};

//개별 도서 조회
const bookDetail = (req, res) => {
  //로그인 상태가 아니면? > liked 빼고 보내고
  //로그인 상태이면 > liked 추가해서

  let authorization = ensureAuthorization(req, res);
  if (authorization instanceof jwt.TokenExpiredError) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "로그인세션이 만료되었습니다. 다시 로그인하세요." });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "잘못된 토큰입니다." });
  } else if (authorization instanceof ReferenceError) {
    //토큰이 없는 경우 > liked 제외
    let book_id = req.params.id;
    let sql = `SELECT *
  , (SELECT count(*) FROM Bookshop.likes WHERE liked_book_id = books.id) as likes
   FROM books
   LEFT JOIN category ON books.category_id = category.category_id
   WHERE books.id=?;
  `;
    let values = [book_id];
    conn.query(sql, values, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }
      if (results[0]) return res.status(StatusCodes.OK).json(results[0]);
      else return res.status(StatusCodes.NOT_FOUND).end();
    });
  } else {
    let book_id = req.params.id;
    let sql = `SELECT *
  , (SELECT count(*) FROM likes WHERE liked_book_id = books.id) as likes
  ,(SELECT EXISTS (SELECT * FROM likes WHERE fk_likes_user_id = ? AND liked_book_id=?)) AS liked
   FROM books
   LEFT JOIN category ON books.category_id = category.category_id
   WHERE books.id=?
  `;
    let values = [authorization.id, book_id, book_id];
    conn.query(sql, values, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }
      if (results[0]) return res.status(StatusCodes.OK).json(results[0]);
      else return res.status(StatusCodes.NOT_FOUND).end();
    });
  }
};

module.exports = { allBooks, bookDetail };
