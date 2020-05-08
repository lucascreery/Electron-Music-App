var mongoose = require('mongoose')
var Song = require('./models/song')
var express = require('express')
var routes = require('./routes')
var cors = require('cors')
var fs = require('fs')
const asyn = require('async')
const mm = require('music-metadata')

mongoose
	.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true})
	.then(() => {
		console.log('Connected to mongoDB')
		var app = express()

		fs.readdir('./music', function(err, items) {
      items.map(async item => {
        let filename = 'music\\' + item
        filename = filename.replace(/\s+/g, '%20')
        const preSong = await Song.findOne({
          filename
        })
        if(!preSong){
          console.log('New song found: ' + filename)            
          mm.parseFile('./music/' + item).then(async (metadata) => {
            const {title, albumartist, album} = metadata.common
            const song = await Song.create({
              title,
              artist: albumartist,
              album,
              filename
            })
          }).catch((err) => {console.log(err)})
          }
      })
		});

		app.use(cors())
		app.use(express.json())
		app.use('/music', routes)

		const PORT = process.env.PORT || 8080;

		app.listen(PORT, () => {
			console.log(`Server listening on port ${PORT}`)
		})
	})

const testSong = new Song({
	title: 'First',
	artist: 'Lucas',
	album: 'first',
	filename: 'First.mp3'
})

/*var express = require('express');
var fs = require('fs');
var ffmetadata = require("ffmetadata");
var asyn = require('async');

var app = express();

app.use(express.static('public'));

app.use('/music', express.static('music'));

app.get('/musiclist', function(req,res){
	let data = [];
	fs.readdir('./music', function(err, items) {
		asyn.map(items, function(item, callback) {
			ffmetadata.read('./music/' + item, callback);
		},
		function(err, metadata){
			for(i in metadata){
				data.push({name: items[i], title: metadata[i].title, album: metadata[i].album, artist: metadata[i].album_artist});
			}
			res.json(data);
			res.end();
		});
	});
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});*/