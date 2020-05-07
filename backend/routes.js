const express = require("express")
const Song = require('./models/song')
const multer = require('multer')
const mm = require('music-metadata')
const util = require('util')

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./music");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  }
});
const upload = multer({storage});

router.use("/", express.static('music'))

router.get("/list", async (req, res) => {
  const songs = await Song.find()
  res.send(songs)
})

router.post("/add", upload.single("song"), async (req, res) => {
  try{
    const preSong = await Song.findOne({
      filename: req.file.path
    })
    if(preSong){
      console.log('song already exists')
      res.status(400).json({
        status: 'fail',
        message: 'Song Already Exists'
      });
    }else{
      const path = req.file.path
      //console.log(path)
      mm.parseFile(__dirname + '/' + path)
      .then(async (metadata) => {
        //console.log(util.inspect(metadata, { showHidden: false, depth: null }));
        const {title, albumartist, album} = metadata.common
        const song = await Song.create({
          title,
          artist: albumartist,
          album,
          filename: path
        })
        res.status(201).json({
          status: 'success',
          data: { filename: path, song: song }
        });
      })
      .catch( err => {
        console.error(err.message);
      });
    }
  } catch (err){
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
})

module.exports = router