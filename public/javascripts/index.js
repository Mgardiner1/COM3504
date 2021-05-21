let name = null;
let roomNo = null;
let imageUrl = "";
let socket= io();

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';
    document.getElementById('takePhoto').style.display = 'none';

    // set up webcam interface list
    selectCamera('');

    //initialise the socket operations as described in the lectures (room joining, chat message receipt etc.)
    initChatSocket();
    // initStreamCanvas();

    if ('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }

    // Registers service worker to store files in cache
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function() { console.log('Service Worker Registered'); });
    }
}

/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
    roomNo = Math.round(Math.random() * 10000);
    document.getElementById('roomNo').value = 'R' + roomNo;
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    // send the chat message
    let chatText = document.getElementById('chat_input').value;
    socket.emit('chat', roomNo, name, chatText);
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
async function connectToRoom() {
    roomNo = document.getElementById('roomNo').value;
    name = document.getElementById('name').value;
    let image_url = document.getElementById('image_url').value;

    //Checks if parameters are defined
    if (name && roomNo && image_url) {

        // Checks if the image url is base64
        if(image_url.substring(0,4) == "data"){

            // Connects to the room
            imageBase = image_url;
            socket.emit('create or join', roomNo, name);
            initCanvas(socket, imageBase, "");
            hideLoginInterface(roomNo, name);
        }
        else {
            // Get the base64 representation of an image if it is in url format
            imageUrl = image_url;
            let data = JSON.stringify({urlImage: image_url});
            await sendURL(data, false, "", false);
        }

    } else {
        document.getElementById("error").textContent = "Please complete all fields";
    }
}

/**
 * Used to send the url to the server to get the base64 representation of the image
 *  * @param data the URL
 *  * @param nextRoom boolean to check if the user is moving to the next room
 *  * @param oldImage the old image the user was looking at
 *  * @param moving boolean, true if the user is trying to move rooms
 */
function sendURL(data, nextRoom, oldImage, moving) {
    $.ajax({
        // set params
        url: '/get_image_url',
        contentType: 'application/json',
        dataType: 'json',
        type: 'POST',
        data: data,

        success: async function (dataR) {
            // Get the base64 representation of the image and go to room
            imageBase = dataR;
            /// Store the next image in the current images indexedDb entry
            if (nextRoom && !moving) {
                await storeOther("image", [imageBase, "next"], oldImage, roomNo);
            }
            socket.emit('create or join', roomNo, name);
            initCanvas(socket, imageUrl, oldImage, moving);
            hideLoginInterface(roomNo, name);
        },
        // catch errors
        error: function (err) {
            // URL is not valid
            alert('Error with AJAX: ' + err.status + ':' + err.statusText);

        }
    });
}

/**
 * Called when the user adds a new image to the room. Adds new image to the room.
 */
async function newImage(){
    let image_url = document.getElementById('image_urlRoom').value;
    let oldImage = imageBase;

    if(image_url){

        recreateCanvas();
        removeChat();
        removeKnowledgeGraph();
        document.getElementById("image_urlRoom").value = ""
        await storeOther("image", [image_url, "next"], imageBase, roomNo);
        if(image_url.substring(0,4) == "data"){
            imageBase = image_url;

            socket.emit('create or join', roomNo, name);
            await initCanvas(socket, imageBase, oldImage);
            hideLoginInterface(roomNo, name);
        }
        else {
            let data = JSON.stringify({urlImage: image_url});
            await sendURL(data, true, oldImage, false)
        }
    }
}

/**
 * Checks whether there is a previous or next room. If there is display the relevant buttons
 */
async function checkNextPrevious(image){

    let values = await nextPreviousIndexed(image, roomNo)
    document.getElementById("nextRoom").hidden = values[0];
    document.getElementById("previousRoom").hidden = values[1];

}

/**
 * Called when recreating the canvas when a new room is made
 */
function recreateCanvas(){
    // Remove the canvas and image elements

    let canvasDiv = document.getElementById("canvas_div")
    let canvas = document.getElementById("canvas");
    let img = document.getElementById("image");
    canvasDiv.removeChild(canvas);
    canvasDiv.removeChild(img);

    // Recreate canvas and image elements
    let newElement = document.createElement("img");
    newElement.style.height = "100%";
    newElement.id = "image"
    canvasDiv.appendChild(newElement);
    newElement = document.createElement("canvas");
    newElement.id = "canvas"
    canvasDiv.appendChild(newElement);

    document.getElementById("nextRoom").hidden = true;
    document.getElementById("previousRoom").hidden = true;
}

/**
 * it appends the given html text to the history div
 * this is to be called when the socket receives the chat message (socket.on ('message'...)
 * @param text: the text to append
 */
function writeOnHistory(text) {
    if (text==='') return;
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    // scroll to the last element
    history.scrollTop = history.scrollHeight;
    document.getElementById('chat_input').value = '';

    //name,data, image, room
    storeOther('chat', text, imageBase, roomNo);

}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('photoCapture').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;
}

/**
 * it initialises the socket for /chat
 */
function initChatSocket() {
    // called when someone joins the room. If it is someone else it notifies the joining of the room
    socket.on('joined', function (room, userId) {
        if (userId === name) {
            // it enters the chat
            hideLoginInterface(room, userId);
        } else {
            // notifies that someone has joined the room
            writeOnHistory('<b>' + userId + '</b>' + ' joined room ' + room);
        }
    });
    // called when a message is received
    socket.on('chat', function (room, userId, chatText) {
        let who = userId
        if (userId === name) who = 'Me';
        writeOnHistory('<b>' + who + ':</b> ' + chatText);
    });

}
/**
 * Called when traversing to next image
 */
async function nextPreviousImage(whichRoom){

    let img = await getNextPreviousImage(whichRoom, imageBase, roomNo)
    imageBase = img;
    recreateCanvas();
    removeChat();
    removeKnowledgeGraph();
    socket.emit('create or join', roomNo, name);
    initCanvas(socket, imageBase, "", true);

}

/**
 * Called from nextPreviousImage. Removes all the current chat from view
 */
function removeChat(){
    let chatDiv = document.getElementById("history");
    while (chatDiv.firstChild) {
        chatDiv.removeChild(chatDiv.lastChild);
    }
}

/**
 * Called from nextPreviousImage. Removes all current knowledge graph elements from view
 */
function removeKnowledgeGraph(){
    let panels = document.getElementById('resultPanels');
    while (panels.firstChild) {
        panels.removeChild(panels.lastChild);
    }
}


/////////////////////////////////////////////////////////////////

/**
 * it appends the given html text to the history div
 * @param text: the text to append
 */
/*
function writeOnChatHistory(text) {
    let history = document.getElementById('chat_history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = ''
}
 */


