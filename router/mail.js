const nodemailer = require('nodemailer');

// 创建一个发送邮件的函数
async function sendEmail(to, subject, message) {
  
    // 创建一个 SMTP 传输对象
    let transporter = nodemailer.createTransport({
        host: 'smtp.qq.com', // 你的 SMTP 服务器地址
        port: 587, // 你的 SMTP 服务器端口
        secure: false, // 如果是 465 端口则设为 true
        auth: {
            user: 'chenduonan@qq.com', // 你的邮箱账号
            pass: 'pkttycypgmaqbhja', // 你的邮箱密码
        },
    });

    // 邮件选项
    let mailOptions = {
        from: '"南瓜起始页" <chenduonan@qq.com>', // 发件人地址
        to: to, // 收件人地址
        subject: subject, // 邮件主题
        text: message, // 邮件内容
    };

    // 发送邮件
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('邮件发送成功: %s', info.messageId);
    } catch (error) {
        console.error('发送邮件失败: %s', error.message);
    }
}

// 调用发送邮件的函数
sendEmail('chenduonan@qq.com', '测试邮件', '这是一封测试邮件内容~~~~~~~~~~~~~~~~~');
