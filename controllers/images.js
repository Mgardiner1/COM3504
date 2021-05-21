let Image = require('../models/images');

// create a function to return an image object from a name query
/**
 * retrieves an image from the database based on author
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getImg = async function (req, res) {
    let imgData = req.body;
    console.log(imgData.author);
    if (imgData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        // find the image
        const images = await Image.find({author: imgData.author})

        //console.log(images);
        //return to user
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(images));
    } catch (e) {
        res.status(500).send('error getting image'+ e);
    }
}

// create a function to insert an image into the database
/**
 * it inserts an image into the database
 * @param res
 * @param req
 */
exports.insert = function(res, req) {
    // get the image
    let imgData = req.req.body;
    console.log(imgData);
    if (imgData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        // implement schema
        let image = new Image({
            title: imgData.title,
            description: imgData.description,
            author: imgData.author,
            image_blob: imgData.image_blob
        });
        console.log(image);
        // save the image
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