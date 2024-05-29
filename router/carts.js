const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCartItems,
  delCartItems,
} = require("../controller/CartController");
router.use(express.json());

//장바구니 담기
router.post("/", addToCart);

//장바구니 아이템 목록 조회 + 선택한 아이템 목록 조회
//id들을 req body로 같이 넘어오면..
router.get("/", getCartItems);

//장바구니 아이템 삭제
router.delete("/:id", delCartItems);


router.get("/carts");

module.exports = router;
