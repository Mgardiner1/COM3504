/**
 * it reads an uploaded file and sends it to MongoDB
 * @param location (in a room or not)
 * @returns {Promise<void>}
 */
async function getFile(location) {
    // hide the previously display image attributes form
    hideImgForm('local', location);
    // get inputs
    let urlInput = document.getElementById('image_url'+location);
    let imgFile = document.getElementById('imgInput'+location).files[0];
    // create a FileReader to read uploaded image
    const reader = new FileReader();

    // add listener
    reader.addEventListener("load", function () {
        // set the URL value of the form to be the read base64 value
        urlInput.value = reader.result;

        // read data from image attribute form and image blob
        let dataForm = readImgForm(location);
        dataForm.image_blob = reader.result;

        // send to mongoDB via AJAX
        let data = JSON.stringify(dataForm);
        sendImageAJAX('/upload_image', data);

    }, false)

    if (imgFile) {
        reader.readAsDataURL(imgFile);
    }
}
