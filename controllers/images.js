let Image = require('../models/images');

// create a function to return an image object from a name query
exports.getImg = async function (req, res) {
    let imgData = req.body;
    console.log(imgData.author);
    if (imgData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        const images = await Image.find({author: imgData.author})

        //console.log(images);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(images));
    } catch (e) {
        res.status(500).send('error getting image'+ e);
    }
}

// create a function to insert an image into the database
exports.insert = function(res, req) {
    let imgData = req.req.body;
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
        console.log(image);
         image.save(function(err,results) {
             if (err) {
                 console.log('Error: ' + err);
             }
             else {
                 console.log(results._id);
             }
        });

    } catch (e) {
        res.status(500).send('error inserting image' + e);
    }
}