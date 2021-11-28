const express = require('express');
const app = express()

const mainRouter = require('./routes/main.js');
const postRouter = require('./routes/post.js');
const memberRouter = require('./routes/member.js');
const adminRouter = require('./routes/admin.js');
const replyRouter = require('./routes/reply.js');
const chatRouter = require('./routes/chat.js');
const inquiryRouter = require('./routes/inquiry.js');

app.use(memberRouter);
app.use(mainRouter);
app.use(postRouter);
app.use(adminRouter);
app.use(replyRouter);
app.use(chatRouter);
app.use(inquiryRouter);


app.listen(3001, ()=>{
    console.log('3001번포트로 실행중');
});