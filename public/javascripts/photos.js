async function prepareVideo(camid) {
    // set session variables
    var session = {
        audio: false,
        video: {
            width: 480,
            height: 270,
            // check if there is a camera
            deviceId: camid ? {exact: camid} : true,
            facingMode: 'environment',
            frameRate: {min: 10}
        }
    }

    // get the user media specified in the session
    navigator.mediaDevices.getUserMedia(session)
        .then(async mediaStream => {
            //await sleep(1000);

            // display the stream
            gotStream(mediaStream, location);
        })
        .catch( function (e) {
            alert('Not supported on this device. Update your browser: ' + e.name);
        });
}

// displays the stream and waits for user to take photo
function gotStream(stream, location) {
    // create mediaElement on video tag and display stream
    let mediaElement = document.getElementById('video'+location);
    mediaElement.style.display = 'block';
    mediaElement.srcObject = stream;
    // listen for #takePhoto button and run snapshot callback when pressed
    var button = document.getElementById('takePhoto'+location);
    button.addEventListener('click', snapshot, false);
    // create canvas to display the stream in
    var canvas = document.getElementById('streamCanvas'+location);
    canvas.height = 270;
    canvas.width = 480;
    var ctx = canvas.getContext('2d');
    // call back function to take snapshot of stream canvas
    async function snapshot() {
        // set scale
        let screenShotScale = Math.min(canvas.width / 480, canvas.height / 270);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // set x & y
        let x = (canvas.width / 2) - (480 / 2) * screenShotScale;
        let y = (canvas.height / 2) - (270 / 2) * screenShotScale;
        // take snapshot
        await ctx.drawImage(mediaElement, x, y, 480 * screenShotScale, 270 * screenShotScale);
        // display snapshot
        document.querySelector('img').src = canvas.toDataURL('image/png');
        // set the URL in the room setup form to be the base64 image
        await setURL(canvas.toDataURL('image/png'));
        // hide mediaStream
        mediaElement.style.display = 'none';
        // reset camera options
        document.getElementById('cameraSelect'+location).style.display = 'block';
        showImgForm('captured', location);
        document.getElementById('takePhoto'+location).style.display = 'none';
        // stop the mediaStream
        await stopCamera(stream);
    }
}
// function to stop camera
async function stopCamera(stream) {
    stream.getTracks().forEach(function(track) {
        track.stop();
    });
}

// gets all possible video sources and displays them in a dropdown menu
async function selectCamera(location) {
    cameraNames=[];
    cameras = [];
    // get media sources
    function getSources(sourceInfos) {
        for (var i = 0; i !== sourceInfos.length; ++i) {
            // find if source is a video input
            var sourceInfo = sourceInfos[i];
            if (sourceInfo.kind === 'videoinput') {
                var text = sourceInfo.label ||
                    'camera ' + (cameras.length + 1);
                // add to lists
                cameraNames.push(text);
                cameras.push(sourceInfo.deviceId);
                // add to dropdown menu
                document.getElementById('cameraOptions'+location).innerHTML = "<option value=" + sourceInfo.deviceId + ">" + text + "</option>";
            } else if (sourceInfo.kind === 'audioinput') {
                audioSource = sourceInfo.deviceId;
            }
        }
    }
    // find all devices then run getSources()
    navigator.mediaDevices.enumerateDevices()
        .then(getSources);
}

// takes selected source and initiates stream process
async function sourceSelect(location) {
    // get the selected dropdown menu item
    let sourceList = document.getElementById("cameraOptions"+location);
    let source = sourceList.options[sourceList.selectedIndex].value;
    // starts video
    await prepareVideo(source, location);
    // hides dropdown menu and adds screenshot button
    document.getElementById('cameraSelect'+location).style.display = 'none';
    hideImgForm('captured', location);
    document.getElementById('takePhoto').style.display = 'block';
}

// functions to show and hide and image attribute input form
function showImgForm(type, location) {
    // if it is an image capture
    if (type == "captured") {
        // hide the local image attribute form it displayed
        hideImgForm('local', location);
        // show the captured image upload button
        document.getElementById('uploadCapturePhoto'+location).style.display = 'block';
    } else {
        // hide the caputured image form if it is displayed
        hideImgForm('captured', location);
        // show the local image upload button
        document.getElementById('uploadLocalPhoto'+location).style.display = 'block'
    }
    // show the rest of the form
    document.getElementById('imageForm'+location).style.display = 'block';
}

function hideImgForm(type, location) {
    // if it is an image capture
    if (type == "captured") {
        // hide any displayed image
        document.querySelector('img').src = "";
        // hide the upload button for image capture
        document.getElementById('uploadCapturePhoto'+location).style.display = 'none';
    // if it is a local upload
    } else if (type=="local") {

        // hide the local upload image button
        document.getElementById('uploadLocalPhoto'+location).style.display = 'none';
    }

    // hide the image attribute form
    document.getElementById('imageForm'+location).style.display = 'none';
}

// function to read the image attribute form
function readImgForm(location) {
    // get all of the paramaters and store in variable data
    var data = {
        title: document.getElementById('imageTitle'+location).value,
        description: document.getElementById('imageDesc'+location).value,
        author: document.getElementById('imageAuthor'+location).value
    };

    return data;
}

// function to send an image to MongoDB
async function sendImage(location) {
    // get the image stream canvas at the current time
    var canvas = document.getElementById('streamCanvas'+location);
    // capture data from the stream and input boxes
    var dataForm = readImgForm(location);

    dataForm.image_blob = canvas.toDataURL('image/png');

    var data = JSON.stringify(dataForm)
    // send data to server
    await sendImageAJAX("/upload_image", data);
    event.preventDefault();
}


async function clearImageResults(location) {
    // find any current images
    var rows = document.getElementsByClassName('image_table'+location);

    // remove them one by one leaving the table headers
    for (i=0; i<rows.length; i++) {
        rows[i].parentElement.remove();
    }
}
async function displayDBImages(location) {
    // get the value of the authorSearch text input
    var data = JSON.stringify({
        author: document.getElementById('authorSearch'+location).value
    });

    // clear previous results if any
    await clearImageResults(location);
    // query the server with that author
    await getImageAJAX("/get_image", data, location);

}

// AJAX function to send images to server
async function sendImageAJAX(url, data) {
    $.ajax({
        // set params
        url: url,
        contentType: 'application/json',
        type: 'POST',
        data: data,
        success: function (dataR) {
            //response is not important
            const r =  dataR;
        },
        // catch errors
        error: function (err) {
            alert('Error with AJAX: ' + err.status + ':' + err.statusText);

        }
    });
}

// function to receive images using AJAX
// takes a url & author data as input
async function getImageAJAX(url, data, location) {
    $.ajax({
        // set params
        url: url,
        contentType: 'application/json',
        type: 'POST',
        data: data,
        success: function (dataR) {
            // check if image(s) exist
            if (dataR.length > 0) {
                // find table
                var table = document.getElementById('image_table'+location);
                const tableClass = room;
                // insert image properties into table
                for (i =0; i < dataR.length; i++) {
                    // create a new row of class tableClass
                    var row = table.insertRow();
                    row.className = tableClass;
                    // create required cells within row
                    var imgCell = row.insertCell(0)
                    var titleCell = row.insertCell(1);
                    var descriptionCell = row.insertCell(2);
                    var authorCell = row.insertCell(3);
                    var buttonCell = row.insertCell(4);
                    // set image thumbnail size
                    const styleOptions = "height:100px;width:150px;";
                    // fill cells
                    imgCell.innerHTML = "<img src=" + dataR[i].image_blob + " style = " + styleOptions+ "></img>";
                    titleCell.innerHTML = dataR[i].title;
                    descriptionCell.innerHTML = dataR[i].description;
                    authorCell.innerHTML = dataR[i].author;


                    let url = dataR[i].image_blob;
                    // create a select image button
                    let button = document.createElement('button');
                    button.textContent = "Select";
                    // add to button cell
                    buttonCell.appendChild(button);
                    // create the onclick function
                    button.onclick = function() {
                        // set the url of the room form to be the base64 image blob
                        document.getElementById('image_url'+location).value = url;
                        // clear the results to tidy up the page
                        clearImageResults(location);

                    }

                }

            }

        },
        // catch errors
        error: function (err) {
            alert('Error with AJAX: ' + err.status + ':' + err.statusText);
        }
    });
}

function setURL(url) {
    document.getElementById('image_url').value = url;
}
/*



async function initStreamCanvas() {
    var button = document.getElementById('takePhoto');
    var video = document.querySelector('video');
    var canvas = document.getElementById('streamCanvas');
    canvas.height = 600;
    canvas.width = 600;
    var ctx = canvas.getContext('2d');
    console.log(ctx.canvas.width);
    button.addEventListener('click', snapshot, false);
    function snapshot() {
        ctx.drawImage(video, 0, 0);
        document.querySelector('img').src = canvas.toDataURL('image/png');
    }
}
*/