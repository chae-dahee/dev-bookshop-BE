const conn = require("../mariadb"); //db module
const { StatusCodes } = require("http-status-codes"); //status codes module

//(요약된)전체 도서 조회 + 카테고리별 조회 + 신간 여부
const allBooks = (req, res) => {
  let { category_id, news, limit, currentPage } = req.query;

  //lim,it : page 당 도서 수
  //currnetPage : 현재 몇 페이지
  //offset : 0부터 시작~ limit * (currnetPage-1)
  let offset = limit * (currentPage - 1);

  let sql = "SELECT * FROM books";
  let values = [];
  if (category_id && news) {
    sql +=
      " WHERE category_id=? and pub_date BETWEEN date_sub(now(), interval 6 month) AND now()";
    values=[category_id];
  } else if (category_id) {
    sql += " WHERE category_id = ?";
    values=[category_id];
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
  let { id } = req.params;

  let sql = `SELECT * FROM books
  LEFT JOIN category ON books.category_id = category_id
  WHERE books.id = ?`;
  conn.query(sql, id, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    if (results[0]) return res.status(StatusCodes.OK).json(results[0]);
    else return res.status(StatusCodes.NOT_FOUND).end();
  });
};

module.exports = { allBooks, bookDetail };
