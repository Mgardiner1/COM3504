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
            gotStream(mediaStream);
        })
        .catch( function (e) {
            alert('Not supported on this device. Update your browser: ' + e.name);
        });
}

// displays the stream and waits for user to take photo
function gotStream(stream) {
    // create mediaElement on video tag and display stream
    let mediaElement = document.getElementById('video');
    mediaElement.style.display = 'block';
    mediaElement.srcObject = stream;
    // listen for #takePhoto button and run snapshot callback when pressed
    var button = document.getElementById('takePhoto');
    button.addEventListener('click', snapshot, false);
    // create canvas to display the stream in
    var canvas = document.getElementById('streamCanvas');
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
        document.getElementById('image_url').value = canvas.toDataURL('image/png')
        // hide mediaStream
        mediaElement.style.display = 'none';
        // reset camera options
        document.getElementById('cameraSelect').style.display = 'block';
        document.getElementById('imageUpload').style.display = 'block';
        document.getElementById('takePhoto').style.display = 'none';
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
async function selectCamera() {
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
                document.getElementById('cameraOptions').innerHTML = "<option value=" + sourceInfo.deviceId + ">" + text + "</option>";
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
async function sourceSelect() {
    // get the selected dropdown menu item
    let sourceList = document.getElementById("cameraOptions");
    let source = sourceList.options[sourceList.selectedIndex].value;
    // starts video
    await prepareVideo(source);
    // hides dropdown menu and adds screenshot button
    document.getElementById('cameraSelect').style.display = 'none';
    document.getElementById('imageUpload').style.display = 'none';
    document.getElementById('takePhoto').style.display = 'block';
}

async function sendImage() {
    var canvas = document.getElementById('streamCanvas');
    var data = JSON.stringify({
        title: document.getElementById('imageTitle').value,
        description: document.getElementById('imageDesc').value,
        author: document.getElementById('imageAuthor').value,
        image_blob: canvas.toDataURL('image/png')
    });
    console.log(data);
    await sendImageAJAX("/upload_image", data);
    event.preventDefault();
}

async function displayDBImages() {
    var data = JSON.stringify({
        author: document.getElementById('authorSearch').value
    });
    await getImageAJAX("/get_image", data);
    console.log(data);

    //console.log(result);
    //console.log(images);
}

async function sendImageAJAX(url, data) {
    $.ajax({
        url: url,
        contentType: 'application/json',
        type: 'POST',
        data: data,
        success: function (dataR) {
            //console.log(dataR);
            const r =  dataR;
            // reload
            //location.reload();
        },
        error: function (error) {
            alert('Error with AJAX: ' + err.status + ':' + err.statusText);

        }
    });
}

async function getImageAJAX(url, data) {
    $.ajax({
        url: url,
        contentType: 'application/json',
        type: 'POST',
        data: data,
        success: function (dataR) {
            const r =  dataR;
            console.log(dataR[0].author);
            var table = document.getElementById('image_table');

            for (i =0; i < dataR.length; i++) {
                var row = table.insertRow();
                var imgCell = row.insertCell(0)
                var titleCell = row.insertCell(1);
                var descriptionCell = row.insertCell(2);
                var authorCell = row.insertCell(3);
                const styleOptions = "height:100px;width:150px;"
                imgCell.innerHTML = "<img src=" + dataR[i].image_blob + " style = " + styleOptions+ "></img>";

                titleCell.innerHTML = dataR[i].title;
                descriptionCell.innerHTML = dataR[i].description;
                authorCell.innerHTML = dataR[i].author;
            }
            // reload
            //location.reload();
        },
        error: function (error) {
            alert('Error with AJAX: ' + err.status + ':' + err.statusText);

        }
    });
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