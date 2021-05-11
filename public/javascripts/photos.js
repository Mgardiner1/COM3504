async function prepareVideo(camid) {
    // set session variables
    var session = {
        audio: false,
        video: {
            width: 720,
            height: 480,
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
    canvas.height = 480;
    canvas.width = 720;
    var ctx = canvas.getContext('2d');
    // call back function to take snapshot of stream canvas
    async function snapshot() {
        // set scale
        let screenShotScale = Math.min(canvas.width / 720, canvas.height / 480);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // set x & y
        let x = (canvas.width / 2) - (720 / 2) * screenShotScale;
        let y = (canvas.height / 2) - (480 / 2) * screenShotScale;
        // take snapshot
        await ctx.drawImage(mediaElement, x, y, 720 * screenShotScale, 480 * screenShotScale);
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
    var data = {
        title: document.getElementById('imageTitle').value,
        description: document.getElementById('imageDesc').value,
        author: document.getElementById('imageAuthor').value,
        image_blob: canvas.toDataURL('image/png')
    };
    console.log(data);
    $.ajax({
        dataType: "json",
        url: '/upload_image',
        type: 'POST',
        data: data,
        success: function(data) {
            token = data.token;
            // reload
            location.reload();
        },
        error: function(err) {
            alert('Error: ' + err.status + ':' + err.statusText);
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