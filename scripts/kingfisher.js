let documentManager, commandManager, view;

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}

function preload() {
    loadExtensions();
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    documentManager = new Manager([new Document()], 1000);
    commandManager = new Manager([], 1000);
    view = new View([width, height]);
}

function draw() {

    const rebuildActiveDocument = (view, documentManager) => {
        if(view == null || documentManager == null) return;
        const ACTIVE_DOCUMENT = documentManager.getActiveObject();
        if(ACTIVE_DOCUMENT == null) return;
        ACTIVE_DOCUMENT.rebuild(view.cursor.getDocumentPosition());
    }

    const updateActiveView = (view, documentManager, commandManager, mouseInputVector, canvasDimensions) => { //TODO make object
        if(view == null || documentManager == null || commandManager == null || mouseInputVector == null) return;
        view.update(documentManager.getActiveObject(), commandManager.getLastObject(), mouseInputVector, canvasDimensions);
    }

    const renderView = (view, documentManager, commandManager) => { //TODO object
        if(view == null || documentManager == null || commandManager == null) return;
        view.render(documentManager.getActiveObject(), commandManager.getLastObject());
    }

    const runActiveCommand = (view, commandManager) => {
        if(view == null || commandManager == null) return;
        const ACTIVE_COMMAND = commandManager.getLastObject();
        if(ACTIVE_COMMAND == null) return;
        const CURSOR = view.cursor;
        if(CURSOR == null) return;
        const DOCUMENT_POSITION = CURSOR.documentPosition;
        if(DOCUMENT_POSITION == null) return;
        ACTIVE_COMMAND.run(DOCUMENT_POSITION);
    }

    //Update the view, cursor and document
    rebuildActiveDocument(view, documentManager);
    updateActiveView(view, documentManager, commandManager, new Vector(mouseX, mouseY), [width, height]);
 
    //Render the interface
    renderView(view, documentManager, commandManager);

    //Run the active command
    runActiveCommand(view, commandManager);
}

function mouseClicked(){

    const triggerReferencePointDrag = (view, activeCommand) => { //TODO rename
        if(activeCommand == null) return null;
        if(activeCommand.commandStatus == CommandStatus.OPEN) return null;
        const REFERENCE_POINT = documentManager.getActiveObject().getReferencePointOnPoint(view.cursor.getDocumentPosition(), 5);
        if(REFERENCE_POINT == null) return null;
        const DRAG_COMMAND = Commands.movereferencepoint(documentManager.getActiveObject()); //global variable
        DRAG_COMMAND.addInput(view.cursor.getDocumentPosition());
        commandManager.addObject(DRAG_COMMAND); //global variable
        console.log("movereferencepoint: opened");
        return true;
    }

    const addCommandInput = (view, activeCommand) => {
        if(activeCommand == null) return;
        if(activeCommand.commandStatus != CommandStatus.OPEN) return;
        activeCommand.addInput(view.cursor.getDocumentPosition()); //TODO check if the cursor needs to be updated first to check for snaps
    }

    const ACTIVE_COMMAND = commandManager.getLastObject(); //global variable
    const TRIGGERED_REFERENCEPOINT_DRAG_RESULT = triggerReferencePointDrag(view, ACTIVE_COMMAND);
    if(TRIGGERED_REFERENCEPOINT_DRAG_RESULT != null) return;
    addCommandInput(view, ACTIVE_COMMAND);
}

function mouseWheel(event){
    view.changeViewScale(event.delta, 0.005);
}

function keyPressed(event){
    view.addCommandBarMessage(documentManager.getActiveObject(), commandManager, event.key);
}

//-------------------------------------------------------

//TODO js export
    //Rewrite class methods
    //Remove ; behind }
    //Paste render.js (Prototype) behind all others
    //Comment out controls
    //Optional: Comment out cursor Renderer
    //Remove comments

//TODO video export

//-------------------------------------------------------

//TODO A* path extensions
//TODO image/ animated GIF object

//-------------------------------------------------------

//TODO reload extensions command

//TODO undo

//TODO tolerance zoom fix for snapping

//TODO snap fix during command execution

//-------------------------------------------------------

//TODO add hatch

//TODO selectionbox

//TODO join command
//TODO split command

//TODO layers

//TODO save dialog box

//TODO document layers

//TODO snapping
    //TODO Add angle snap
    //TODO filter for each input
    //TODO snapping viewscale repair

//TODO closepolyline command