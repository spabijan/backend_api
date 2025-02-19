const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./routes/auth');
const SERVER_LISTEN_PORT = 3000;

const app = express();
const DB = "mongodb+srv://rezyser55:doTzBHH07FOlTBqz@cluster0.5woi5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

app.use(express.json());
app.use(authRouter)

mongoose.connect(DB).then(() => {
    console.log('MongoDB Connected');
});

app.listen(SERVER_LISTEN_PORT, "0.0.0.0", function () {
    console.log(`server is running on port ${SERVER_LISTEN_PORT}`);
});