require('dotenv').config();
const express = require('express');
const { Client } = require('whatsapp-web.js');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const SESSION_PATH = path.join(__dirname, 'session.json');

const options = {
  session: fs.existsSync(SESSION_PATH) ? require(SESSION_PATH) : undefined,
  puppeteer: { headless: process.env.HEADLESS === 'true' },
};

const app = express();
const client = new Client(options);

app.use(express.json());
app.use(cors());

app.post('/sendMessage', async (req, res) => {
  const { to: phone, message } = req.body;
  try {
    const to = phone.includes('@c.us') ? phone : `${phone}@c.us`;
    await client.sendMessage(to, message);
    res.json({
      statusCode: 200,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error'
    });
  }
});

client.on('authenticated', session => fs.writeFileSync(SESSION_PATH, JSON.stringify(session)));

client.on('ready', () => {
  app.listen(process.env.PORT || 3000, () => console.log('Server is ready!'));
});

client.initialize();