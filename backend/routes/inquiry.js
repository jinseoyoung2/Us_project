const express = require('express');
const mysql = require('mysql');
const config = require('../config/config.json');
const bodyParser = require('body-parser');
const pool = mysql.createPool(config);
const router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }))
const cors = require('cors');
router.use(cors({origin : 'http://localhost:3000', credentials : true, methods : "put,get,post,delete,options"}));


// 문의하기
router.route('/inquiry').post((req, res) => {
    const memberIdx = req.body.memberIdx;
    const respondent = req.body.respondent;
    const title = req.body.title;
    const content = req.body.content;
    const type = req.body.type;
    if (pool) {
        inquiry(memberIdx, title, content, type, respondent, (err, result) => {
            if (err) {
                res.writeHead('200', { 'content-type': 'text/html; charset=utf8' });
                res.write('<h2>메인데이터 출력 실패 </h2>');
                res.write('<p>데이터가 안나옵니다.</p>')
                res.end();
            } else {
                res.send(result);
            }
        })
    }
})
//문의 하기
const inquiry = function (memberIdx, title, content, type, respondent, callback) {
    pool.getConnection((err, conn) => {
        if (err) {
            console.log(err);
        } else {
            if (respondent == undefined || respondent == 'undefined') {
                conn.query('insert into inquiry(memberIdx, title, content, type) values (?,?,?,?)', [memberIdx, title, content, type], (err, result) => {
                    conn.release();
                    if (err) {
                        callback(err, null);
                        return;
                    } else {
                        callback(null, true);
                    }
                })
            } else {
                conn.query('insert into inquiry(memberIdx, title, content, type, respondent) values (?,?,?,?,?)', [memberIdx, title, content, type, respondent], (err, result) => {
                    conn.release();
                    if (err) {
                        callback(err, null);
                        return;
                    } else {
                        callback(null, true);
                    }
                })
            }
        }
    });
}

// 사용자 문의 내역
router.route('/member/inquirylist').get((req, res) => {
    const cur = req.query.page;
    const idx = req.query.idx;
    if (pool) {
        userInquiry(cur, idx, (err, result) => {
            if (err) {
                res.writeHead('200', { 'content-type': 'text/html; charset=utf8' });
                res.write('<h2>메인데이터 출력 실패 </h2>');
                res.write('<p>데이터가 안나옵니다.</p>')
                res.end();
            } else {
                res.send(result);
            }
        });
    }
});
// 문의 목록
const userInquiry = function (cur, idx, callback) {
    // 페이지 당 게시물 수
    const page_size = 10;
    // 페이지의 갯수
    const page_list_size = 5;
    // limit의 변수
    let no = "";
    // 전체 게시물숫자
    let totalPageCount = 0;
    // 현재 페이지
    let curPage = cur;

    pool.getConnection((err, conn) => {
        if (err) {
            console.log(err);
        } else {
            conn.query('select count(*) as cnt from inquiry where memberIdx = ?', [idx], (err, result) => {
                if (err) {
                    console.log(err);
                    console.log('sql문 오류')
                } else {
                    totalPageCount = result[0].cnt;

                    if (totalPageCount < 0) {
                        totalPageCount = 0;
                    }

                    // 전체 페이지수
                    const totalPage = Math.ceil(totalPageCount / page_size);
                    // 전체 세트수
                    const totalSet = Math.ceil(totalPage / page_list_size);
                    // 현재 세트 번호
                    const curSet = Math.ceil(curPage / page_list_size);
                    //  현재 세트내 출력될 첫 페이지
                    const startPage = ((curSet - 1) * 5) + 1;
                    // 현재 세트내 출력될 마지막 페이지
                    let endPage = (startPage + page_list_size) - 1;

                    if (curPage < 0) {
                        no = 0
                    } else {
                        no = (curPage - 1) * 10
                    }

                    if (endPage > totalPage) {
                        endPage = totalPage;
                    }

                    conn.query('select idx, title, type, message, createdAt as cnt from inquiry where memberIdx = ? order by idx desc limit ?, ?;', [idx, no, page_size], (err, result) => {
                        conn.release();
                        if (err) {
                            callback(err, null);
                            console.log('sql문 오류')
                            return;
                        } else {
                            callback(null, { result, startPage, endPage, totalPage });
                        }
                    });
                }
            });
        }
    });
}


// 사용자 문의 상세 내역
router.route('/member/inquirydetail').get((req, res) => {
    const idx = req.query.idx;
    if (pool) {
        inquiryDetail(idx, (err, result) => {
            if (err) {
                res.writeHead('200', { 'content-type': 'text/html; charset=utf8' });
                res.write('<h2>메인데이터 출력 실패 </h2>');
                res.write('<p>데이터가 안나옵니다.</p>')
                res.end();
            } else {
                res.send(result);
            }
        });
    }
});
// 문의 상세 내역
const inquiryDetail = function (idx, callback) {
    pool.getConnection((err, conn) => {
        if (err) {
            console.log(err);
        } else {
            const sql1 = 'select m.idx, m.name, m.img, i.type, i.content, i.createdAt, i.message from inquiry as i join member m on i.memberIdx = m.idx where i.idx = ?;';
            const sql1s = mysql.format(sql1, idx)

            const sql2 = 'select m.name, m.email from inquiry as i join member m on i.respondent = m.idx where i.idx = ?;';
            const sql2s = mysql.format(sql2, idx)

            conn.query(sql1s + sql2s, (err, result) => {
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


// 문의 - 친구리스트
router.route('/inquiry/friend').get((req, res) => {
    const idx = req.query.idx;
    const friend = req.query.friend;
    if (pool) {
        inquiry_friend(idx, friend, (err, result) => {
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
        res.end();
    }
})

const inquiry_friend = function (idx, friend, callback) {
    console.log(friend)
    pool.getConnection((err, conn) => {
        if (err) {
            console.log(err);
        } else {
            if(friend==undefined||friend==''||friend=='undefined'){
                conn.query('select m.idx, m.img, m.email, m.name from friend as f join member as m on m.idx = f.friendIdx where f.memberIdx = ?;', [idx], (err, result) => {
                    conn.release();
                    if (err) {
                        callback(err, null);
                        return;
                    } else {
                        callback(null, result);
                    }
                });
            }else{
                const keyword = "%" + friend + "%"; 
                conn.query('select m.idx, m.img, m.email, m.name from friend as f join member as m on m.idx = f.friendIdx where f.memberIdx = ? and m.name like ?;', [idx, keyword], (err, result) => {
                    conn.release();
                    if (err) {
                        callback(err, null);
                        return;
                    } else {
                        callback(null, result);
                    }
                });
            }
            
        }
    });
}

module.exports = router