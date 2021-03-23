function prepareVideo(camid) {
    var session = {
        audio: false,
        video: {
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
    let mediaElement = document.getElementById('video');mediaElement.srcObject = stream;
}


function selectCamera() {
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

function sourceSelect() {
    let sourceList = document.getElementById("cameraOptions");
    let source = sourceList.options[sourceList.selectedIndex].value;
    prepareVideo(source);
    document.getElementById('cameraSelect').style.display = 'none';
    document.getElementById('takePhoto').style.display = 'block';
}
function initStreamCanvas() {
    var button = document.getElementById('takePhoto');
    var video = document.querySelector('video');
    var canvas = document.getElementById('streamCanvas');
    var ctx = canvas.getContext('2d');
    var localMediaStream = null;
    button.addEventListener('click', snapshot, false);
    navigator.mediaDevices.getUserMedia({video: true}, function(stream) {
        video.src = window.URL.createObjectURL(stream);
        localMediaStream = stream;
    }, /* @todo errorCallback*/);

    function snapshot() {
        if (localMediaStream) {
            ctx.drawImage(video, 0, 0);
            document.querySelector('img').src = canvas.toDataURL('image/png');
        }
    }
}
