const express = require('express');
const mysql = require('mysql');
const config = require('../config/config.json');
const bodyParser = require('body-parser');
const pool = mysql.createPool(config);

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }))

// 로그인 후 이동되는 메인페이지
router.route('/main').get((req, res) => {
    const idx = req.query.idx;
    if (pool) {
        main(idx, (err, result) => {
            if (err) {
                res.writeHead('200', { 'content-type': 'text/html; charset=utf8' });
                res.write('<h2>메인데이터 출력 실패 </h2>');
                res.write('<p>데이터가 안나옵니다.</p>')
                res.end();
            } else {
                res.send(result);
            }
        });
    } else {
        res.writeHead('200', { 'content-type': 'text/html;charset=utf8' });
        console.log('pool이 없대욥');
        res.write('<p>mongodb 데이터베이스에 연결하지 못했습니다 </p>')
        res.end();
    }
});

// 메인페이지 채팅부분
router.route('/main/chat').get((req, res) => {
    const idx = req.query.idx;
    if (pool) {
        mainChat(idx, (err, result) => {
            if (err) {
                res.writeHead('200', { 'content-type': 'text/html; charset=utf8' });
                res.write('<h2>메인데이터 출력 실패 </h2>');
                res.write('<p>데이터가 안나옵니다.</p>')
                res.end();
            } else {
                res.send(result);
            }
        });
    } else {
        res.writeHead('200', { 'content-type': 'text/html;charset=utf8' });
        console.log('pool이 없대욥');
        res.write('<p>mongodb 데이터베이스에 연결하지 못했습니다 </p>')
        res.end();
    }
});

// 메인페이지 위치부분
router.route('/main/place').get((req, res) => {
    const idx = req.query.idx;
    if (pool) {
        mainPlace(idx, (err, result) => {
            if (err) {
                res.writeHead('200', { 'content-type': 'text/html; charset=utf8' });
                res.write('<h2>메인데이터 출력 실패 </h2>');
                res.write('<p>데이터가 안나옵니다.</p>')
                res.end();
            } else {
                res.send(result);
            }
        });
    } else {
        res.writeHead('200', { 'content-type': 'text/html;charset=utf8' });
        console.log('pool이 없대욥');
        res.write('<p>mongodb 데이터베이스에 연결하지 못했습니다 </p>')
        res.end();
    }
});

// 친구 검색
router.route('/main/friend').post((req, res) => {
    const invitationCode = req.body.code;
    console.log(invitationCode)

    if (pool) {
        invitation(invitationCode, (err, result) => {
            if (err) {
                res.writeHead('201', { 'content-type': 'text/html; charset=utf8' });
                res.write('<h2>메인데이터 출력 실패 </h2>');
                res.write('<p>데이터가 안나옵니다.</p>')
                res.end();
            } else {
                res.send(result);
            }
        });
    } else {
        res.writeHead('200', { 'content-type': 'text/html;charset=utf8' });
        console.log('pool이 없대욥');
        res.write('<p>mongodb 데이터베이스에 연결하지 못했습니다 </p>')
        res.end();
    }
});

// 친구 추가
router.route('/main/insert_friend').post((req, res) => {
    const email = req.body.email;
    const idx = req.body.idx;

    if (pool) {
        insertFriend(email, idx, (err, result) => {
            if (err) {
                res.writeHead('201', { 'content-type': 'text/html; charset=utf8' });
                res.write('<h2>메인데이터 출력 실패 </h2>');
                res.write('<p>데이터가 안나옵니다.</p>')
                res.end();
            } else {
                res.writeHead('202', { 'content-type': 'text/html; charset=utf8' });
                res.write('<h2>저장 성공 </h2>');
                res.write('<p>너무 잘되욥</p>')
                res.end();
            }
        })
    }
})





// 메인페이지
const main = function (idx, callback) {
    pool.getConnection((err, conn) => {
        if (err) {
            console.log(err);
        } else {
            const sql1 = 'select email, message, name, img from member where idx = ?;';
            const sql1s = mysql.format(sql1, idx);

            const sql2 = 'select count(*) as postCnt from post where memberIdx = ?;'
            const sql2s = mysql.format(sql2, idx);

            const sql3 = 'select count(*) as friendCnt from friend where memberIdx = ?;'
            const sql3s = mysql.format(sql3, idx);

            const sql4 = 'select img, email from member where idx in (select f.friendIdx from member as m join friend as f on m.idx = f.memberIdx where m.idx = ?);';
            const sql4s = mysql.format(sql4, idx);

            const sql5 = 'select i.imgName, p.createdAt from post as p join img as i on p.idx = i.postIdx where p.memberIdx = ?;';
            const sql5s = mysql.format(sql5, idx);

            conn.query(sql1s + sql2s + sql3s + sql4s + sql5s, (err, result) => {
                conn.release();
                if (err) {
                    callback(err, null);
                    return;
                } else {
                    callback(null, result);
                }
            });
        }
    });
}

// 메인페이지 채팅
const mainChat = function (idx, callback) {
    pool.getConnection((err, conn) => {
        if (err) {
            console.log(err);
        } else {
            const sql1 = 'select email, message, name, img from member where idx = ?;';
            const sql1s = mysql.format(sql1, idx);

            const sql2 = 'select count(*) as postCnt from post where memberIdx = ?;'
            const sql2s = mysql.format(sql2, idx);

            const sql3 = 'select count(*) as friendCnt from friend where memberIdx = ?;'
            const sql3s = mysql.format(sql3, idx);

            const sql4 = 'select img, email from member where idx in (select f.friendIdx from member as m join friend as f on m.idx = f.memberIdx where m.idx = ?);';
            const sql4s = mysql.format(sql4, idx);

            // 채팅 query문
            // select r.title, rm.memberIdx, m.img, m.name, (select content from chat where createdAt = (select max(createdAt) from chat where roomIdx = r.idx)) as chat from room_mem as rm join member as m on rm.memberIdx = m.idx join room as r on r.idx = rm.roomIdx where r.title in(select r.title from room_mem as rm join room as r on rm.idx = r.idx where rm.memberIdx = 1 group by r.title having rm.memberIdx != 1);
            const sql5 = 'select r.title, rm.memberIdx, m.img, m.name, (select content from chat where createdAt = (select max(createdAt) from chat where roomIdx = r.idx)) as chat, (select max(createdAt) from chat where roomIdx = r.idx) as time from room_mem as rm join member as m on rm.memberIdx = m.idx join room as r on r.idx = rm.roomIdx where r.title in (select title from room_mem as rm join room as r on rm.roomIdx = r.idx where rm.memberIdx = ?) and m.idx != ?;';
            const data = [idx, idx];
            const sql5s = mysql.format(sql5, data);

            conn.query(sql1s + sql2s + sql3s + sql4s + sql5s, (err, result) => {
                conn.release();
                if (err) {
                    callback(err, null);
                    return;
                } else {
                    callback(null, result);
                }
            });
        }
    });
}

// 메인페이지 위치
const mainPlace = function (idx, callback) {
    pool.getConnection((err, conn) => {
        if (err) {
            console.log(err);
        } else {
            const sql1 = 'select email, message, name, img from member where idx = ?;';
            const sql1s = mysql.format(sql1, idx);

            const sql2 = 'select count(*) as postCnt from post where memberIdx = 1;'
            const sql2s = mysql.format(sql2, idx);

            const sql3 = 'select count(*) as friendCnt from friend where memberIdx = 1;'
            const sql3s = mysql.format(sql3, idx);

            const sql4 = 'select img, email from member where idx in (select f.friendIdx from member as m join friend as f on m.idx = f.memberIdx where m.idx = ?);';
            const sql4s = mysql.format(sql4, idx);

            // 위치 query문

            conn.query(sql1s + sql2s + sql3s + sql4s, (err, result) => {
                conn.release();
                if (err) {
                    callback(err, null);
                    return;
                } else {
                    callback(null, result);
                }
            });
        }
    });
}

// 친구 검색
const invitation = function (invitationCode, callback) {
    pool.getConnection((err, conn) => {
        if (err) {
            console.log(err);
        } else {
            conn.query('select name, message, img from member where code = ?', [invitationCode], (err, result) => {
                conn.release();
                if (err) {
                    callback(err, null);
                    return;
                } else {
                    callback(null, result);
                }
            });
        }
    });
}

// 친구 추가
const insertFriend = function (email, idx, callback) {
    pool.getConnection((err, conn) => {
        if (err) {    
            console.log(err)
        } else {
            conn.query('select idx from member where email = ?', [email], (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    conn.query('insert into friend(memberIdx, friendIdx) values(?, ?)', [idx, result[0].idx], (err, result) => {
                        conn.release();
                        if(err){
                            callback(err, null)
                            console.log('select문 오류')
                            return;
                        }else{
                            callback(null, result);
                        }
                    });
                }
            })
        }
    })
}

module.exports = router