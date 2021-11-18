const multer = require("multer");
const {GridFsStorage} = require('multer-gridfs-storage');

const storage = new GridFsStorage({
    url: process.env.DB,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
            const filename = `${Date.now()}-${file.originalname}`;
            return filename; 
    },
});

module.exports = multer({ storage });