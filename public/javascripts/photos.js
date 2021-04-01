async function prepareVideo(camid) {
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

    navigator.mediaDevices.getUserMedia(session)
        .then(async mediaStream => {
            //await sleep(1000);
            gotStream(mediaStream);
        })
        .catch( function (e) {
            alert('Not supported on this device. Update your browser: ' + e.name);
        });
}

function gotStream(stream) {
    let mediaElement = document.getElementById('video');
    mediaElement.style.display = 'block';
    mediaElement.srcObject = stream;
    var button = document.getElementById('takePhoto');
    button.addEventListener('click', snapshot, false);
    var canvas = document.getElementById('streamCanvas');
    canvas.height = 480;
    canvas.width = 720;
    var ctx = canvas.getContext('2d');
    async function snapshot() {
        let screenShotScale = Math.min(canvas.width / 720, canvas.height / 480);
        // get the top left position of the image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let x = (canvas.width / 2) - (720 / 2) * screenShotScale;
        let y = (canvas.height / 2) - (480 / 2) * screenShotScale;
        ctx.drawImage(mediaElement, x, y, 720 * screenShotScale, 480 * screenShotScale);
        document.querySelector('img').src = canvas.toDataURL('image/png');
        document.getElementById('image_url').value = canvas.toDataURL('image/png')
        mediaElement.style.display = 'none';
        document.getElementById('cameraSelect').style.display = 'block';
        document.getElementById('takePhoto').style.display = 'none';
        await stopCamera(stream);
    }
}

async function stopCamera(stream) {
    stream.getTracks().forEach(function(track) {
        track.stop();
    });
}

async function selectCamera() {
    cameraNames=[];
    cameras = [];
    function getSources(sourceInfos) {
        for (var i = 0; i !== sourceInfos.length; ++i) {
            var sourceInfo = sourceInfos[i];
            console.log(sourceInfo);
            if (sourceInfo.kind === 'videoinput') {
                var text = sourceInfo.label ||
                    'camera ' + (cameras.length + 1);
                cameraNames.push(text);
                cameras.push(sourceInfo.deviceId);
                document.getElementById('cameraOptions').innerHTML = "<option value=" + sourceInfo.deviceId + ">" + text + "</option>";
            } else if (sourceInfo.kind === 'audioinput') {
                audioSource = sourceInfo.deviceId;
            }
        }
    }
    navigator.mediaDevices.enumerateDevices()
        .then(getSources);
}

async function sourceSelect() {
    let sourceList = document.getElementById("cameraOptions");
    let source = sourceList.options[sourceList.selectedIndex].value;
    await prepareVideo(source);
    document.getElementById('cameraSelect').style.display = 'none';
    document.getElementById('takePhoto').style.display = 'block';
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