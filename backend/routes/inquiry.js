const express = require('express');
const mysql = require('mysql');
const config = require('../config/config.json');
const bodyParser = require('body-parser');
const pool = mysql.createPool(config);
const router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }))

// 문의하기
// ❗️이건 영범오빠한테 물어보기(이런식으로 하는게 맞는지!!)❗️
router.route('/inquiry').post((req, res) => {
    const memberIdx = req.body.memberIdx;
    const title = req.body.title;
    const content = req.body.content;
    const type = req.body.type;
    const sql = 'insert into inquiry(memberIdx, title, content, type) values (?,?,?,?)';
    const data = [memberIdx, title, content, type];
    console.log(`memberIdx:${memberIdx}, title:${title}, content:${content}, type:${type}`);

    pool.query(sql, data, (err, rows, fields) => {
        if (err) {
            console.log('err : ' + err);
            res.writeHead('200', { 'content-type': 'text/html;charset=utf-8' });
            res.write('<h2>문의 실패!</h2>');
            res.write('<p>오류가 발생했습니다</p>');
            res.end();
        } else {
            console.log(rows);
            res.json({message : "문의 성공!"});
        }
    })
});


module.exports = router