const http = require('http');
const mail = require('nodemailer');

require('dotenv').config();

const port = process.env.PORT || 1000;

const ServiceSenter = mail.createTransport({
    service: process.env.mailservice,
    auth: {
        user: process.env.mail,
        pass: process.env.mailpass
    }
});

function GenerateCode(length) {
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/sendMail') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const { to, title, text } = JSON.parse(body);

            const options = {
                from: process.env.mail,
                to: to,
                subject: title,
                text: text + '\n<h6>Письмо, присланное с этой почты является рассылочным. Владелец почты не несёт ответственность за содержание письма.</h6>'
            };

            ServiceSenter.sendMail(options, (error) => {
                if (error) {
                    res.writeHead(520, {'Content-Type':'application/json'});
                    res.end(JSON.stringify({ successful: false }));
                }
                else {
                    res.writeHead(200, {'Content-Type':'application/json'});
                    res.end(JSON.stringify({ successful: true }));
                }
            });
            return;
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/api/sendMails') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const { to, title, text } = JSON.parse(body);

            const options = {
                from: process.env.mail,
                to: to.join(','),
                subject: title,
                text: text + '\n<h6>Письмо, присланное с этой почты является рассылочным. Владелец почты не несёт ответственность за содержание письма.</h6>'
            };

            ServiceSenter.sendMail(options, (error) => {
                if (error) {
                    res.writeHead(520, {'Content-Type':'application/json'});
                    res.end(JSON.stringify({ successful: false }));
                }
                else {
                    res.writeHead(200, {'Content-Type':'application/json'});
                    res.end(JSON.stringify({ successful: true }));
                }
            });
            return;
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/api/codeConfirm') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const { to, senter } = JSON.parse(body);

            const code = GenerateCode(8);

            const options = {
                from: process.env.mail,
                to: to,
                subject: `Код подтверждения для ${senter}`,
                text: `Ваш код подтверждения для ${senter}:\n${code}`
            };

            ServiceSenter.sendMail(options, (error) => {
                if (error) {
                    res.writeHead(520);
                    res.end();
                }
                else {
                    res.writeHead(200, {'Content-Type':'text/plain'});
                    res.end(code);
                }
            });
            return;
        });
        return;
    }
});

server.listen(port, '0.0.0.0', () => {
    console.log('> Successful start');
});