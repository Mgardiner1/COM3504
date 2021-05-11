let Image = require('../models/images');

// create a function to return an image object from a name query
exports.getImg = function (req, res) {
    let imgData = req.body;
    if (imgData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        Image.find()
            .where('title').equals(imgData.title)
            .select('title description author image_blob')
            .exec(function(err, result) {
                if (err)
                    res.status(500).send('Invalid data!');
                let image = {
                    title: result.title,
                    description: result.description,
                    author: result.author,
                    image_blob: result.image_blob
                }

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(image));
            });
    } catch (e) {
        res.status(500).send('error '+ e);
    }
}

// create a function to insert an image into the database
exports.insert = function(res, req) {
    let imgData = req.body;
    console.log(imgData);
    if (imgData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        let image = new Image({
            title: imgData.title,
            description: imgData.description,
            author: imgData.author,
            image_blob: imgData.image_blob
        });

        image.save(function(err,results) {
            console.log(results._id);
        });

    } catch (e) {
        res.status(500).send('error ' + e);
    }
}