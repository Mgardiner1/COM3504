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

cameraNames=[]; cameras = [];
function getSources(sourceInfos) {
    for (var i = 0; i !== sourceInfos.length; ++i) {
        var sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === 'video') {
            var text = sourceInfo.label ||
                'camera ' + (cameras.length + 1);
            cameraNames.push(text);
            cameras.push(sourceInfo.id);
        } else if (sourceInfo.kind === 'audio') {
            audioSource = sourceInfo.id;
        }
    }
    videoSource = cameras[cameras.length - 1];
}
navigator.mediaDevices.enumerateDevices().then(getSources);