const mongoose = require('mongoose')

const banerSchema = mongoose.Schema({
    image: {
        type: String, required: true,
    }
})

const Banner = mongoose.model("Banner", banerSchema);
module.exports = Banner;
