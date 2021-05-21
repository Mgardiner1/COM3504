/**
 * this file contains the functions to control the drawing on the canvas
 */
let room;
let userId;
//let color = 'red',
let thickness = 4;
let imageBase;
let ctx;
let cvx;

/**
 * it inits the image canvas to draw on. It sets up the events to respond to (click, mouse on, etc.)
 * it is also the place where the data is sent via socket.io
 * @param sckt the open socket to register events on
 * @param imageUrl the image url to download
 * @param oldImage previous image url for transitioning to new image
 */
async function initCanvas(sckt, imageUrl, oldImage) {
    socket = sckt;
    userId = document.getElementById('who_you_are').value; // this isn't working for some reason
    room = document.getElementById('roomNo').value;

    //sets up original values for use for each client
    let flag = false,
        prevX, prevY, currX, currY = 0;
    let canvas = $('#canvas');
    cvx = document.getElementById('canvas');
    let img = document.getElementById('image');
    img.src = imageBase;
    ctx = cvx.getContext('2d');
    ctx.save();

    // event on the canvas when the mouse is on it
    canvas.on('mousemove mousedown mouseup mouseout', function (e) {
        let color = document.getElementById('colorOptions').value;

        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.position().left;
        currY = e.clientY - canvas.position().top;
        if (e.type === 'mousedown') {
            flag = true;
        }
        if (e.type === 'mouseup' || e.type === 'mouseout') {
            flag = false;
        }
        // if the flag is up, the movement of the mouse draws on the canvas
        if (e.type === 'mousemove') {
            if (flag) {
                drawOnCanvas(imageBase, ctx, canvas.width, canvas.height, prevX, prevY, currX, currY, color, thickness);
                // draw on the canvas, lets everyone know via socket.io by sending them drawOnCanvas data
                socket.emit('pic', room, canvas.width, canvas.height, prevX, prevY, currX, currY, color, thickness);
            }
        }
    });

    // Captures button click for clearing the canvas for everyone in room
    $('.canvas-clear').on('click', function (e) {
        let c_width = canvas.width
        let c_height = canvas.height
        ctx.clearRect(0, 0, c_width, c_height);
        clearAnnotations(imageBase, room);
        img.height = c_height;
        img.width = c_width;
        drawImageScaled(img, cvx, ctx);
        // communicates that a client has cleared the canvas everyone via socket.io
        socket.emit('clear', room)
    });

    // Capture event when someone else clears the canvas
    socket.on('clear-display', function (room) {
        let c_width = canvas.width
        let c_height = canvas.height
        ctx.clearRect(0, 0, c_width, c_height);
        clearAnnotations(imageBase, room);
        img.height = c_height;
        img.width = c_width;
        drawImageScaled(img, cvx, ctx);
    });

    // capture the event on the socket when someone else is drawing on their canvas (socket.on...)
    socket.on('pic_display', function (room, width, height, x1, y1, x2, y2, color, thickness) {
        //document.getElementById('who_you_are').innerHTML= "Third test";
        drawOnCanvas(imageBase, ctx, width, height, x1, y1, x2, y2, color, thickness)
    });

    // this is called when the src of the image is loaded
    // this is an async operation as it may take time
    img.addEventListener('load', () => {
        // it takes time before the image size is computed and made available
        // here we wait until the height is set, then we resize the canvas based on the size of the image
        let poll = setInterval(async function () {
            if (img.naturalHeight) {
                clearInterval(poll);
                // resize the canvas
                let ratioX = 1;
                let ratioY = 1;
                // if the screen is smaller than the img size we have to reduce the image to fit
                if (img.clientWidth > window.innerWidth)
                    ratioX = window.innerWidth / img.clientWidth;
                if (img.clientHeight > window.innerHeight)
                    ratioY = img.clientHeight / window.innerHeight;
                let ratio = Math.min(ratioX, ratioY);
                // resize the canvas to fit the screen and the image
                cvx.width = canvas.width = img.clientWidth * ratio;
                cvx.height = canvas.height = img.clientHeight * ratio;
                // draw the image onto the canvas
                drawImageScaled(img, cvx, ctx);
                // hide the image element as it is not needed
                img.style.display = 'none';
                //Adding past image data to idb for follow checking paths
                await addData({
                    'image': imageBase,
                    'room': document.getElementById('roomNo').value,
                    'annotations': [],
                    'chat': [],
                    'knowledge': [],
                    'previousImage': oldImage,
                    'nextImage': ""
                });
                await checkNextPrevious(imageBase);

            }
        }, 10);
    });

}

/**
 * called when to clear the current canvas for new a drawing
 */
function resetCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Restore the transform
    ctx.restore(); // Clears the specific canvas completely for new drawing
}


/**
 * called when it is required to draw the image on the canvas. We have resized the canvas to the same image size
 * so ti is simpler to draw later
 * @param img
 * @param canvas
 * @param ctx
 */
function drawImageScaled(img, canvas, ctx) {
    let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    // get the top left position of the image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let x = (canvas.width / 2) - (img.width / 2) * scale;
    let y = (canvas.height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
}


/**
 * this is called when we want to display what we (or any other connected via socket.io) draws on the canvas
 * note that as the remote provider can have a different canvas size (e.g. their browser window is larger)
 * we have to know what their canvas size is so to map the coordinates
 * @param ctx the canvas context
 * @param canvasWidth the originating canvas width
 * @param canvasHeight the originating canvas height
 * @param prevX the starting X coordinate
 * @param prevY the starting Y coordinate
 * @param currX the ending X coordinate
 * @param currY the ending Y coordinate
 * @param color of the line
 * @param thickness of the line
 * @param dashed determines if line is dashed
 */
async function drawOnCanvas(image, ctx, canvasWidth, canvasHeight, prevX, prevY, currX, currY, color, thickness, dashed=false) {

    //get the ration between the current canvas and the one it has been used to draw on the other computer
    let ratioX= cvx.width/canvasWidth;
    let ratioY= cvx.height/canvasHeight;

    // update the value of the points to draw
    prevX*=ratioX;
    prevY*=ratioY;
    currX*=ratioX;
    currY*=ratioY;
    if (dashed) {
        ctx.setLineDash([10,5]);
    }
    //draws path
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.stroke();
    ctx.closePath();

    //Stores annotation data in idb
    let data = [canvasWidth, canvasHeight, prevX, prevY, currX, currY, color, thickness];
    await storeOther('annotations', data, image, roomNo);
}
/*
async function imgResize(img, cvx, ctx, canvas) {
    // resize the canvas
    let ratioX=1;
    let ratioY=1;
    // if the screen is smaller than the img size we have to reduce the image to fit
    if (img.clientWidth>window.innerWidth)
        ratioX=window.innerWidth/img.clientWidth;
    if (img.clientHeight> window.innerHeight)
        ratioY= img.clientHeight/window.innerHeight;
    console.log(img.clientHeight, img.clientWidth);
    let ratio= Math.min(ratioX, ratioY);
    // resize the canvas to fit the screen and the image
    cvx.width = canvas.width = img.clientWidth*ratio;
    cvx.height = canvas.height = img.clientHeight*ratio;
    // draw the image onto the canvas
    await drawImageScaled(img, cvx, ctx);
    // hide the image element as it is not needed
    img.style.display = 'none';
}*/