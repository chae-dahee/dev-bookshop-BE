const express = require("express");
const { allCategory } = require("../controller/CategoryController");
const router = express.Router();

router.use(express.json());

//전체 카테고비 조회
router.get("/", allCategory);

module.exports = router;
