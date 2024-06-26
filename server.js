// 引入必要的模块
const http = require('http');
const WebSocket = require('ws');

// 导入模块
const mysql = require('mysql')

// 创建HTTP服务器
const server = http.createServer();

// 创建MySQL连接
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'my_db_01',
  password: 'b3DzkLbKZirMhpGh',
  database: 'my_db_01',
});

// 连接到MySQL数据库
connection.connect(err => {
  if (err) {
      console.error('Error connecting to the database:', err);
      return;
  }
  console.log('Connected to the database');
});


// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });


// 处理客户端连接事件
wss.on('connection', (ws) => {
   // 发送历史消息给新连接的客户端
   connection.query('SELECT * FROM chat_messages ORDER BY timestamp ASC', (err, results) => {
    if (err) {
        console.error('Error retrieving messages:', err);
        return;
    }
    ws.send(JSON.stringify(results));
});

  ws.on('message', (message) => {
      connection.query(
        'INSERT INTO chat_messages (message) VALUES (?)',
        [`${message}`],
        (err, result) => {
            if (err) {
                console.error('Error saving message:', err);
                return;
            }

            // 广播消息给所有连接的客户端
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify([{message: `${message}`}]));
                }
            });
        }
    );
  });

  ws.on('close', () => {
      console.log('Client disconnected');
  });
});
// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
