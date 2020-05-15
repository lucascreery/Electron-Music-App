const express = require("express")
const Song = require('./models/song')
const multer = require('multer')
const mm = require('music-metadata')
const fs = require('fs')

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

router.get("/download/:file", (req, res) => {
  filename = req.params.file
  filename = filename.replace('%20', /\s+/g)
  res.download(__dirname + '/music/' + filename , (err) => {
    if(err) console.log('Error: ' + err)
  })
})

router.get("/delete/:file", async (req, res) => {
  filename = req.params.file
  console.log(filename)
  let editfilename = filename.replace(/\s+/g, '%20')
  try {
    let dataName = 'music\\' + editfilename
    await Song.deleteOne({filename: dataName}, async (err, result) => {
      if(err){
        console.log('Error: ' + err)
      }else if(result.n != 0){
        console.log(result)
        const songs = await Song.find()
        res.send(songs)
        fs.unlinkSync(__dirname + '/music/' + filename)    
      }else{
        console.log('No file found')
        res.status(400).send({
          error: result
        })
      }
    })
  } catch (err) {
    console.log('ERROR: ' + err)
    res.status(400).send({
      error: 'Could not delete' + filename
    })
  }
})

router.post("/edit/:id", async (req, res) => {
  try {
    const song = await Song.findOne({ _id: req.params.id})
    const {title, album, artist} = req.body
    song.title = title
    song.album = album
    song.artist = artist
    await song.save()
    const songs = await Song.find()
    res.send(songs)
  } catch {
    res.status(400).send({
      error: 'Could not Update'
    })
  }
})

module.exports = router