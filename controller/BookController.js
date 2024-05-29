const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

//(요약된)전체 도서 조회 + 카테고리별 조회 + 신간 여부
const allBooks = (req, res) => {
  let { category_id, news, limit, currentPage } = req.query;

  //lim,it : page 당 도서 수
  //currnetPage : 현재 몇 페이지
  //offset : 0부터 시작~ limit * (currnetPage-1)
  let offset = limit * (currentPage - 1);

  let sql = `SELECT *,
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
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    if (results.length) return res.status(StatusCodes.OK).json(results);
    else return res.status(StatusCodes.NOT_FOUND).end();
  });
};

//개별 도서 조회
const bookDetail = (req, res) => {
  let { user_id } = req.body;
  let book_id = req.params.id;

  let sql = `SELECT *
  , (SELECT count(*) FROM Bookshop.likes WHERE liked_book_id = books.id) as likes
  ,(SELECT EXISTS (SELECT * FROM likes WHERE user_id = 1 AND liked_book_id=?)) AS liked
   FROM books
   LEFT JOIN category ON books.category_id = category.category_id
   WHERE books.id=?;
  `;
  let values = [user_id, book_id, book_id];
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    if (results[0]) return res.status(StatusCodes.OK).json(results[0]);
    else return res.status(StatusCodes.NOT_FOUND).end();
  });
};

module.exports = { allBooks, bookDetail };
