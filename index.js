const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./routes/auth');
const bannerRouter = require('./routes/banner');
const categoryRouter = require('./routes/category');
const subCategoryRouter = require('./routes/sub_category');
const productRouter = require('./routes/product');
const productReviewRouter = require('./routes/product_review');
const vendorRouter = require('./routes/vendors');
const orderRouter = require('./routes/order');
const SERVER_LISTEN_PORT = process.env.PORT || 3000;
const cors = require('cors');

const app = express();
const DB = "mongodb+srv://rezyser55:doTzBHH07FOlTBqz@cluster0.5woi5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

app.use(express.json());
app.use(cors())
app.use(authRouter)
app.use(bannerRouter)
app.use(categoryRouter)
app.use(subCategoryRouter)
app.use(productRouter)
app.use(productReviewRouter)
app.use(vendorRouter)
app.use(orderRouter)

mongoose.connect(DB).then(() => {
    console.log('MongoDB Connected');
});

app.listen(SERVER_LISTEN_PORT, "0.0.0.0", function () {
    console.log(`server is running on port ${SERVER_LISTEN_PORT}`);
});