// function to read uploaded file and upload it to MongoDB
async function getFile() {
    // hide the previously display image attributes form
    hideImgForm('local');
    // get inputs
    let urlInput = document.getElementById('image_url');
    let imgFile = document.getElementById('imgInput').files[0];
    // create a FileReader to read uploaded image
    const reader = new FileReader();

    // add listener
    reader.addEventListener("load", function () {
        // set the URL value of the form to be the read base64 value
        urlInput.value = reader.result;

        // send data to MongoDB
        let dataForm = readImgForm();
        dataForm.image_blob = reader.result;

        let data = JSON.stringify(dataForm);
        sendImageAJAX('/upload_image', data);

    }, false)

    if (imgFile) {
        reader.readAsDataURL(imgFile);
    }
}