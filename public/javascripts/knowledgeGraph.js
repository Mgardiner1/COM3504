const service_url = 'https://kgsearch.googleapis.com/v1/entities:search';
const apiKey= 'AIzaSyAG7w627q-djB4gTTahssufwNOImRqdYKM';
//let room;
//let socket= io();

/**
 * it inits the widget by selecting the type from the field myType
 * and it displays the Google Graph widget
 * it also hides the form to get the type
 */
function widgetInit(){
    let type= document.getElementById("myType").value;
    if (type) {
        let config = {
            'limit': 10,
            'languages': ['en'],
            'types': [type],
            'maxDescChars': 100,
            'selectHandler': selectItem,
        }
        KGSearchWidget(apiKey, document.getElementById("myInput"), config);
        document.getElementById('typeSet').innerHTML= 'of type: '+type;
        document.getElementById('widget').style.display='block';
        document.getElementById('typeForm').style.display= 'none';
    }
    else {
        alert('Set the type please');
        document.getElementById('widget').style.display='none';
        document.getElementById('resultPanel').style.display='none';
        document.getElementById('typeSet').innerHTML= '';
        document.getElementById('typeForm').style.display= 'block';
    }
}

/**
 * callback called when an element in the widget is selected
 * @param event the Google Graph widget event {@link https://developers.google.com/knowledge-graph/how-tos/search-widget}
 */

/**
 * receives the JSON-LD of the selected Knowledge Graph Item
 * JSON-LD to IndexDB for later display
 * JSON-LD to socket.io for display to other users
 */
async function selectItem(event){
    console.log(event);
    let row;
    if(event.row) {
        row = event.row;
    }
    else{
        row = event;
    }
    // get the current color
    let color = document.getElementById('colorOptions').value;
    // put information into a table
    await createPanel(row.id, row.name, row.rc, row.qc, color)
    // Display to other users - send information other users
    room = document.getElementById('roomNo').value;
    await storeOther('knowledge', row, imageBase, roomNo);
    //Sends knowledge data to other users
    socket.emit('knowledge', room, row.id, row.name, row.rc, row.qc, color);
}

//Receives knowledge data for other users bar sender and displays in view
socket.on('knowledge_display', function (id, name, rc, qc, color) {
     createPanel(id, name, rc, qc, color)
         .then(r => {})
});

// displays the JSON-LD in a panel
async function createPanel(id, name, description, url, color) {
    let panels = document.getElementById('resultPanels');
    let panel = document.createElement('div');
    panel.className = 'resultPanel';
    panel.innerHTML = `
    <h3>`+ name + `</h3>
    <h4>`+ id + `</h4>
    <div>` + description + `</div>
    <div>
        <a href=`+ url + `>
            Link to Webpage
        </a>
    </div>`

    panel.style.display= 'block';
    panel.style.border= 'thick solid' + color;

    panels.appendChild(panel);
}

/**
 * currently not used. left for reference
 * @param id
 * @param type
 */
function queryMainEntity(id, type){
    const  params = {
        'query': mainEntityName,
        'types': type,
        'limit': 10,
        'indent': true,
        'key' : apiKey,
    };
    $.getJSON(service_url + '?callback=?', params, function(response) {
        $.each(response.itemListElement, function (i, element) {

            $('<div>', {text: element['result']['name']}).appendTo(document.body);
        });
    });
}

// Displays knowledge panels and form when user clicks 'Turn on Knowledge Annotation'
async function knowledgeOn() {
    document.getElementById('knowledgeForm').style.display = 'block';
    document.getElementById('knowledgePanel').style.display = 'block';
    document.getElementById('knowledgeOn').style.display = 'none';
    document.getElementById('knowledgeOff').style.display = 'block';
}

// Removes knowledge form when user clicks 'Turn off Knowledge Annotation'
async function knowledgeOff() {
    document.getElementById('knowledgeForm').style.display = 'none';
    document.getElementById('knowledgeOn').style.display = 'block';
    document.getElementById('knowledgeOff').style.display = 'none';
}