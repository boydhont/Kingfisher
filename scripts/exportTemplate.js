let documentManager, commandManager, view;

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}

function preload() {
    //loadExtensions();
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    documentManager = new Manager([new Document()], 1000);
    commandManager = new Manager([], 0); //TODO make this endless
    view = new View([width, height]);

}

/*function testAddSomething() //TODO delete this function
{
    const command = getCommands(documentManager.getActiveObject(), "line").addInput(new Vector(0,0)).addInput(new Vector(50,100));
    commandManager.addObject(command);
}*/

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

    //TODO delete this
    //if(frameCount == 10) testAddSomething(); //TODO change this to all extensions have been loaded
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
//PAGE TRANSIT
//-------------------------------------------------------

//The commandStatus enum

const CommandStatus = {OPEN: "Command open", CLOSED: "Command closed", CANCELED: "Command canceled"};

//The base command class

class Command
{

    //Constructor

    constructor(document, name, condition, execute, render) //TODO make this object
    {
        this.message = "";
        this.document = document;
        this.name = name;
        this.condition = condition;
        this.execute = execute;
        this.commandStatus = CommandStatus.OPEN;
        this.input = [];
        this.currentMouseInput = null;
        this.render = render;
        if(name === undefined) this.name = "";
        if(condition === undefined) this.condition = new function(){};
        if(execute === undefined) this.condition = new function(){};
        if(render === undefined) this.render = new function(){}
    }

    //Non-chainable methods

    duplicate(){return new Command(this.document, this.name, this.condition, this.execute, this.render);}

    getCodeString(){
        //const command = getCommands(documentManager.getActiveObject(), "line").addInput(new Vector(0,0)).addInput(new Vector(50,100));
        let s = 'const command = getCommands(documentManager.getActiveObject(), "' + this.name + '")';
        for(const input of this.input) s+= ".addInput(new Vector(" + input.x + "," + input.y +"))"
        s += ";"
        const codeString = s;
        return codeString;
    }

    //Chainable methods

    run(currentMouseInput){
        if(this.commandStatus != CommandStatus.OPEN) return this;
        this.currentMouseInput = currentMouseInput;
        //this.render(); //TODO insert view here
        if(this.condition() == false) return this;
        this.execute(this.document);
        this.message = "";
        this.commandStatus = CommandStatus.CLOSED;
        //commandManager.addObject(this); //TODO do this clean
        console.log(commandManager); //TODO remove this
        console.log(this.getCodeString());
        return this;
    };

    addInput(input){
        if(this.commandStatus != CommandStatus.OPEN) return;
        this.input.push(input);
        return this;
    }

    cancel(){
        if(this.commandStatus != CommandStatus.OPEN) return this; 
        this.commandStatus = CommandStatus.CANCELED;
        console.log(this.name + this.commandStatus);
        return this;
    }

    log(message){
        this.message = message
        return this;
    };
}

//Commands retriever
function getCommands(document, message)
{
    for(let f in Commands) if(f == message) return Commands[f](document);
    return null;
}

//Commands array
let Commands = {};

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

//A document contains a collection of elements

class Document {

    //Constructor

    constructor(elements)
    {
        this.elements = elements;
        if(elements === undefined) this.elements = [];
    }

    //Non-chainable Methods

    getElementsOnPoint(point, tolerance){
        let selection = [];
        for(let e of this.elements) if(e.collision(point,tolerance)) selection.push(e);
        return selection;
    }

    getReferencePointOnPoint(point, tolerance){
        for(let e of this.elements)
        {
            const REFERENCE_POINT = e.getReferencePointOnPoint(point, tolerance);
            if(REFERENCE_POINT == null) continue;
            return REFERENCE_POINT;
        }
        return null;
    }

    //Chainable Methods

    addElement(element){
        this.elements.push(element);
        return this;
    }

    rebuild(cursorDocumentPosition){
        for(let e of this.elements) e.rebuild(cursorDocumentPosition);
        return this;
    };

    clear(){
        this.elements = [];
        return this;
    }

}

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

//An Element is an object that groups a set of geometry under certain rules

class Element {

    //Constructor

    constructor(geometry) {
        this.geometry = geometry;
        if(geometry === undefined) this.geometry = [];
    }

    //Non-chainable methods

    collision(point,tolerance){
        for(const GEOMETRY of this.geometry) if(GEOMETRY.collision(point,tolerance)) return true;
        return false;
    };

    getReferencePointOnPoint(point, tolerance){
        for(const GEOMETRY of this.geometry)
        {
            const referencePoint = GEOMETRY.getReferencePointOnPoint(point, tolerance);
            if(referencePoint == null) continue;
            return referencePoint;
        }
        return null;
    }

    //Chainable methods

    rebuild(cursorDocumentPosition){
        for(const GEOMETRY of this.geometry) GEOMETRY.rebuild(cursorDocumentPosition);
        return this;
    }

}

//Vanilla element creater helpers/wrappers

const Elements = {
    arc: (centerPoint, radius, startAngle, endAngle) => new Element([new Arc(centerPoint, radius, startAngle, endAngle)]),
    circle: (centerPoint, radius) => new Element([new Circle(centerPoint, radius)]),
    line: (startPoint, endPoint) => new Element([new Line(startPoint, endPoint)]),
    polyline: (vertices, isClosed) => new Element([new PolyLine(vertices, isClosed)]),
    ray: (startPoint, direction) => new Element([new Ray(startPoint, direction)])
}

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

//Vector

//Serves as invisible control points- and directions

class Vector {

    //Constructor

    constructor(x,y) {
        this.x = x;
        this.y = y;
        if(x === undefined) this.x = 0.0;
        if(y === undefined) this.y = 0.0;
    }
}

//Geometry

//Primitive classes that can be used to define and draw (smart) elements

class Geometry {

    // Constructor

    constructor(referencePoints, type) {
        this.referencePoints = referencePoints;
        this.geometryType = type;
        if(referencePoints === undefined) this.referencePoints = [];
        if(type === undefined) this.geometryType = "";
    }

    //Non-chainable methods

    collision(point,tolerance){return false;}

    getReferencePointOnPoint(point, tolerance){
        const getTwoPointVector = (a,b) => new Vector(b.x-a.x, b.y-a.y);
        const getDistanceBetweenVectors = (a,b) => Math.pow(Math.pow(getTwoPointVector(a,b).x,2)+Math.pow(getTwoPointVector(a,b).y,2),0.5);

        if(this.collision(point, tolerance) == null) return null;
        for(const REFERENCE_POINT of this.referencePoints) if(getDistanceBetweenVectors(REFERENCE_POINT, point) <= tolerance) return REFERENCE_POINT;
        return null;
    }

    //Chainable methods

    rebuild(cursorDocumentPosition){return this;}

}

class Arc extends Geometry {

    //Constructor

    constructor(centerPoint, radius, startAngle, endAngle) { //TODO input object
        super([centerPoint], "arc");
        this.centerPoint = centerPoint;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        if(centerPoint === undefined) this.centerPoint = new Vector();
        if(radius === undefined) this.radius = 1.0;
        if(startAngle === undefined) this.startAngle = 0.0;
        if(endAngle === undefined) this.endAngle == Math.PI; //TODO check if PI is default javascript
    }

    //Non-chainable methods

    collision(point,tolerance){return false;} //TODO expand

    //Chainable methods

    rebuild(cursorDocumentPosition){return this;}
}

class Circle extends Geometry {

    //Constructor

    constructor(centerPoint, radius) {
        super([centerPoint, new Vector(centerPoint.x, centerPoint.y+radius)], "circle");
        this.centerPoint = centerPoint;
        this.radius = radius;
        if(centerPoint === undefined) this.centerPoint = new Vector();
        if(radius === undefined) this.radius = 1.0;
    }

    //Non-chainable methods

    collision(point,tolerance){
        const distance = this.getDistanceBetweenVectors(this.centerPoint, point);
        const error = Math.abs(this.radius-distance);
        if(error <= tolerance || distance <= tolerance) return true;
        return false;
    };
    
    getDistanceBetweenVectors(a,b){
        const twoPointVector = new Vector(b.x-a.x, b.y-a.y);
        const distance = Math.pow(Math.pow(twoPointVector.x,2)+Math.pow(twoPointVector.y,2),0.5);
        return distance;
    }

    //Chainable methods

    rebuild(cursorDocumentPosition){
        this.centerPoint = this.referencePoints[0];
        this.radius = this.getDistanceBetweenVectors(this.referencePoints[0], this.referencePoints[1]);
        return this;
    };
}

class Line extends Geometry {

    //Constructor

    constructor(startPoint, endPoint) {
        super([startPoint,endPoint], "line");
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        if(startPoint === undefined) this.startPoint = new Vector();
        if(endPoint === undefined) this.endPoint = new Vector();
    }

    //Non-chainable methods

    collision(point,tolerance){
        const CALIBRATION = 125;
        const CROSS_PRODUCT = (point.y-this.startPoint.y)*(this.endPoint.x-this.startPoint.x)-(point.x-this.startPoint.x)*(this.endPoint.y-this.startPoint.y);
        if(Math.abs(CROSS_PRODUCT) > tolerance*CALIBRATION) return false;
        const DOT_PRODUCT = (point.x-this.startPoint.x)*(this.endPoint.x-this.startPoint.x)+(point.y-this.startPoint.y)*(this.endPoint.y-this.startPoint.y);
        if(DOT_PRODUCT < 0) return false;
        const SQUARED_LENGTH = (this.endPoint.x-this.startPoint.x)*(this.endPoint.x-this.startPoint.x)+(this.endPoint.y-this.startPoint.y)*(this.endPoint.y-this.startPoint.y);
        if(DOT_PRODUCT > SQUARED_LENGTH) return false;
        return true;
    }; 

    //Chainable methods

    rebuild(cursorDocumentPosition){
        this.startPoint = this.referencePoints[0];
        this.endPoint = this.referencePoints[1];
        return this;
    };
}

class PolyLine extends Geometry
{
    constructor(vertices, isClosed)
    {
        super(vertices, "polyline");
        this.vertices = vertices;
        this.isClosed = isClosed;
        if(vertices === undefined) this.vertices = [];
        if(isClosed === undefined) this.isClosed = false;
    }

    collision(point,tolerance){
        const isPointOnLineSegment = (a,b) => {
            const l = new Line(a, b);
            if(l.collision(point, tolerance)) return true;
            return false;
        }

        if(this.vertices.length < 2) return false;
        for(let i = 1; i<this.vertices.length; i++) if(isPointOnLineSegment(this.vertices[i-1], this.vertices[i])) return true;
        if(this.isClosed == false) return false;
        if(isPointOnLineSegment(this.vertices[0], this.vertices[this.vertices.length-1])) return true;
        return false;
    };

    //Chainable methods

    rebuild(){
        const getVerticesWithoutDuplicates = (vertices) => {

            const getDistanceBetweenPoints = (a,b) => {
                const twoPointVector = new Vector(b.x-a.x, b.y-a.y);
                const distance = Math.pow(Math.pow(twoPointVector.x,2)+Math.pow(twoPointVector.y,2),0.5);
                return distance;
            }
            let cleanedVertices = [];
            for(const vertex of vertices)
            {
                let isDuplicate = false;
                for(const savedVertex of cleanedVertices) if(getDistanceBetweenPoints(vertex, savedVertex) == 0) isDuplicate = true; //TODO tolerance
                if(isDuplicate) continue;
                cleanedVertices.push(vertex);
            }
            if(cleanedVertices.length != vertices.length) print("cleaned vertices");
            return cleanedVertices;
        }

        this.referencePoints = getVerticesWithoutDuplicates(this.referencePoints);
        this.vertices = this.referencePoints;

        return this;
    }
}

class Ray extends Geometry {

    //Constructor

    constructor(startPoint, direction) {
        super([startPoint], "ray");
        this.startPoint = startPoint;
        this.direction = direction;
        if(startPoint === undefined) this.startPoint = new Vector();
        if(direction === undefined) this.direction = new Vector();
    }

    //Non-chainable methods

    collision(point,tolerance){return false;} //TODO expand

    //Chainable methods

    rebuild(cursorDocumentPosition){return this;} //TODO expand
}

//An enum to initiate geometry types from a sting //TODO move up in the file

const GeometryTypes = {
    geometry: [Geometry, "referencePoints", "type"],
    arc: [Arc, "centerPoint", "radius", "startAngle", "endAngle"],
    circle: [Circle, "centerPoint", "radius"],
    line: [Line, "startPoint", "endPoint"],
    polyLine: [PolyLine, "vertices", "isClosed"],
    ray: [Ray, "startPoint", "direction"]
}

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

Commands.savedxf = (document) => new Command(
    document, "save",
    () => true,
    () => saveDxf(document),
    () => null
  );
  
  const saveDxf = (document) => {
    const fileName = File.getRandomFileName();
    //const fileName = prompt("Set the file name (.dxf)", File.getRandomFileName());
    if(fileName == null || fileName == "") return;
    saveStrings(getDxfStringsFromDocument(document),fileName, "dxf");
  };
  
  const getDxfStringsFromDocument = (document) => {
  
    const getDxfElementStrings = (element) => {
      
      const getDxfGeometryStrings = (geometry) => {
       
        const getDxfLineStrings = (a,b) => {
          return [
            "0",
            "LINE",
            "8",
            "0", //Current layer
            "10",
            a.x.toString(), //a.x
            "20",
            (-a.y).toString(), //a.y
            //"30",
            //"0", //a.z
            "11",
            b.x.toString(), //b.x
            "21",
            (-b.y).toString(), //b.y
            //"31",
            //"0" //b.z
          ];
        }
  
        const getDxfCircleStrings = (c,r) => {
          return [
            "0",
            "CIRCLE",
            "8",
            "0", //Current layer
            "10",
            c.x.toString(), //centerpoint x
            "20",
            (-c.y).toString(), //centerpoint y
            //"30",
            //"0", //centerpoint.z
            "40",
            r.toString() //radius
          ];
        }
  
        const getDxfPolylineStrings = (v,c) => {
          let dxfString = [
            "0",
            "LWPOLYLINE",
            "8",
            "0",  //Current layer
            "90",
            v.length.toString(), //Amount of vertices
            "70"
          ];
  
          if(c) dxfString.push("1"); else dxfString.push("0"); //Open/closed polyline 
          for(const vertex of v) dxfString = dxfString.concat(["10",vertex.x.toString(),"20",(-vertex.y).toString()]); //Vertex positions
  
          return dxfString;
        }
  
        if(geometry instanceof Line) return getDxfLineStrings(geometry.startPoint, geometry.endPoint);
        if(geometry instanceof Circle) return getDxfCircleStrings(geometry.centerPoint, geometry.radius);
        if(geometry instanceof PolyLine) return getDxfPolylineStrings(geometry.vertices, geometry.isClosed);
        return [];
      }
  
      let stringArrayBuilder = [];
      for(const geometry of element.geometry) stringArrayBuilder = stringArrayBuilder.concat(getDxfGeometryStrings(geometry));
      return stringArrayBuilder;
    }
  
    const getDxfHeaderStrings = () => {
      return [
        "0",
        "SECTION",
        "2",
        "ENTITIES"
      ];
    }
  
    const getDxfFooterStrings = () => {
      return [
        "0",
        "ENDSEC",
        "0",
        "EOF"
      ];
    }
  
    let stringArrayBuilder = [];
    stringArrayBuilder = stringArrayBuilder.concat(getDxfHeaderStrings());
    for(const element of document.elements) stringArrayBuilder = stringArrayBuilder.concat(getDxfElementStrings(element));
    stringArrayBuilder = stringArrayBuilder.concat(getDxfFooterStrings());
    const dxfStringArray = stringArrayBuilder;
    return dxfStringArray;
  }

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

let File = {
    getDocumentAsStrings: (document) => JSON.stringify(document),
    getDocumentFromString: (string) => { //TODO add try/catch
        let jsonDocument = JSON.parse(string);
        console.log(jsonDocument);
        let document = new Document();
        for(let e of jsonDocument.elements) 
        {
            let element = new Element();
            for(let g of e.geometry) 
            {
                const gT = GeometryTypes[g.geometryType];
                let geometry = new gT[0](g[gT[1]], g[gT[2]], g[gT[3]], g[gT[4]]); //TODO do this pretty
                let referencePoints = [];
                for(let v of g.referencePoints) referencePoints.push(new Vector(v.x, v.y));
                geometry.referencePoints = referencePoints;
                element.geometry.push(geometry);
            }
            document.addElement(element);
        }
        return document;
    }, //TODO add try/catch
    getRandomFileName: () => ""+year()+month()+day()+hour()+minute()+second(),
    save: (document) => {
        const fileName = File.getRandomFileName();
        //const fileName = prompt("Set the file name (.json)", File.getRandomFileName());
        if(fileName == null || fileName == "") return;
        saveStrings([File.getDocumentAsStrings(document)],fileName, "json");
    }, //TODO add taskdialog
    open: (callback) => {
        let reader = new FileReader();
        let fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.onchange = e => { 
            let file = e.target.files[0]; 
            reader.readAsText(file,'UTF-8');
            reader.onload = readerEvent => 
            {
                let content = readerEvent.target.result;
                callback(content); //TODO callback function that uses the content
            }
        }
        fileSelector.click();
    },
}

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

const DEFAULT_THEME_SETTINGS = '[{"themeName": "Default Theme", "vectorFillColor": "#ffffff", "commandBarFillColor": "#282828", "commandBarTextColor": "#ffffff", "cursorStrokeColor": "#ffffff", "cursorStrokeWeight": 2, "viewBackgroundColor": "#000000", "viewRegularElementsStrokeColor": "#ffffff", "viewRegularElementsStrokeWeight": 2, "viewHoverElementsStrokeColor": "#505050", "viewHoverElementsStrokeWeight": 2, "viewCommandElementsStrokeColor": "#ffffff", "viewCommandElementsStrokeWeight": 2}]';

const BAUHAUS_THEME_SETTINGS = '[{"themeName": "Bauhaus Theme", "vectorFillColor": "#2f2f2f", "commandBarFillColor": "#dd6d53", "commandBarTextColor": "#f8efd6", "cursorStrokeColor": "#2f2f2f", "cursorStrokeWeight": 2, "viewBackgroundColor": "#f8efd6", "viewRegularElementsStrokeColor": "#2f2f2f", "viewRegularElementsStrokeWeight": 2, "viewHoverElementsStrokeColor": "#dd6d53", "viewHoverElementsStrokeWeight": 2, "viewCommandElementsStrokeColor": "#2f2f2f", "viewCommandElementsStrokeWeight": 2}]';
const DIGITAL_RENAISSANCE_THEME_SETTINGS = '[{"themeName": "Digital Renaissance Theme", "vectorFillColor": "#ffffff", "commandBarFillColor": "#282828", "commandBarTextColor": "#ffffff", "cursorStrokeColor": "#ffffff", "cursorStrokeWeight": 2, "viewBackgroundColor": "#151618", "viewRegularElementsStrokeColor": "#ffffff", "viewRegularElementsStrokeWeight": 2, "viewHoverElementsStrokeColor": "#e5bb27", "viewHoverElementsStrokeWeight": 2, "viewCommandElementsStrokeColor": "#ffffff", "viewCommandElementsStrokeWeight": 2}]';
const META_MODERNISM_THEME_SETTINGS = '[{"themeName": "Meta Modernism Theme", "vectorFillColor": "#1885c9", "commandBarFillColor": "#1885c9", "commandBarTextColor": "#f3f3f3", "cursorStrokeColor": "#1a90da", "cursorStrokeWeight": 2, "viewBackgroundColor": "#f3f3f3", "viewRegularElementsStrokeColor": "#1a90da", "viewRegularElementsStrokeWeight": 2, "viewHoverElementsStrokeColor": "#a4a4ae", "viewHoverElementsStrokeWeight": 2, "viewCommandElementsStrokeColor": "#a4a4ae", "viewCommandElementsStrokeWeight": 2}]';

const ATOM_THEME_SETTINGS = '[{"themeName": "Atom Theme", "vectorFillColor": "#f2f2f2", "commandBarFillColor": "#333842", "commandBarTextColor": "#f2f2f2", "cursorStrokeColor": "#f2f2f2", "cursorStrokeWeight": 2, "viewBackgroundColor": "#21252b", "viewRegularElementsStrokeColor": "#f2f2f2", "viewRegularElementsStrokeWeight": 2, "viewHoverElementsStrokeColor": "#589dd5", "viewHoverElementsStrokeWeight": 2, "viewCommandElementsStrokeColor": "#b75d66", "viewCommandElementsStrokeWeight": 2}]';

//TODO Other architecture themes //333842

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

//The commandbar takes an input string and converts it to a string message

class CommandBar {

    //Constructor

    constructor() {
        this.message = "";
    }

    //Non-chainable methods
    
    isMessageRelativeInputCommand(commandManager, input, message){
        const isActiveCommandFitForRelativeInput = (commandManager) => {
            const activeCommand = commandManager.getLastObject();
            if(activeCommand == null) return false;
            if(activeCommand.commandStatus != CommandStatus.OPEN) return false;
            if(activeCommand.input <= 0) return false;
        }

        const isMessageNewTextCommand = (input, message) => {
            if(message.length <= 0 && input.toLowerCase() != input.toUpperCase()) return true;
            return false;
        }

        const isMessageExtendedTextCommand = (input, message) => {
            if(message.toUpperCase() == message.toLowerCase()) return false;
            if(input.toUpperCase() == input.toLowerCase()) return false;
            return true;
        }

        if(isActiveCommandFitForRelativeInput(commandManager) == false) return false;
        if(isMessageNewTextCommand(input, message)) return false;
        if(isMessageExtendedTextCommand(input, message)) return false;
        return true;
    }

    getExtendedMessage(message, input, isMessageRelativeInputCommand){

        const getExtendedTextMessage = (message, input) => {
            if(input.toLowerCase() == input.toUpperCase()) return message;
            return message + input.toLowerCase();
        }

        const getExtendedRelativeInputMessage = (message, input) => {
            if(isNaN(input) && input != "," && input != "." && input != "-") return message;
            if(input.toLowerCase() != input.toUpperCase()) message = "";
            return message + input;
        }

        if(input.length != 1) return message;
        if(isMessageRelativeInputCommand == false) message = getExtendedTextMessage(message, input);
        if(isMessageRelativeInputCommand) message = getExtendedRelativeInputMessage(message,input);
        return message;
    }

    //Chainable methods

    addMessage(document, commandManager, input){
        //TODO add spacebar trigger
        if(input === undefined || input == null) return;
        if(input == " ") this.executeLastCommand(commandManager);
        if(input == "Escape") this.cancelLastCommand(commandManager);
        if(input == "Backspace" && this.message.length > 0) this.message = this.message.substring(0,this.message.length-1);
        if(input == "Enter") this.executeMessage(document, commandManager);
        const isMessageRelativeInputCommand = this.isMessageRelativeInputCommand(commandManager, input, this.message);
        this.message = this.getExtendedMessage(this.message, input, isMessageRelativeInputCommand);
        return this;
    };

    executeMessage(document, commandManager){

        const isMessageTextString = (message) => {if(message.toUpperCase() != message.toLowerCase()) return true; return false}

        const executeCommandMessage = (document, commandManager) => {
            const command = getCommands(document, this.message);
            this.message = "";
            for(let previousCommand of commandManager.objects) 
            {
                if(previousCommand == null) continue;
                previousCommand.cancel();
            }
            if(command == null) return;
            commandManager.addObject(command);
            console.log(command.name + " started"); //TODO remove print
        }

        const executeRelativeInputMessage = (commandManager) => {

            const getVectorFromOneParsableString = (splittedMessage, commandManager) => {

                const getAmplitudedVector = (a,b,amplitude) => {
                    const getDistanceBetweenVectors = (a,b) => {
                        const twoPointVector = new Vector(b.x-a.x, b.y-a.y);
                        const distance = Math.pow(Math.pow(twoPointVector.x,2)+Math.pow(twoPointVector.y,2),0.5);
                        return distance;
                    }
                    const getTwoPointVector = (a,b) => new Vector(b.x-a.x, b.y-a.y);
                    const getMultipliedVector = (v,factor) => new Vector(v.x*factor, v.y*factor);
                    if(a === undefined || b === undefined || amplitude === undefined) return null;
                    const distance = getDistanceBetweenVectors(a,b);
                    if(distance == 0) return null;
                    const multiplicationFactor = 1/distance;
                    const unitVector = getMultipliedVector(getTwoPointVector(a,b), multiplicationFactor);
                    return getMultipliedVector(unitVector,amplitude);
                }

                const getActiveCommand = (commandManager) => { //TODO write this in the command manager
                    if(commandManager == null) return null;
                    const activeCommand = commandManager.getLastObject();
                    if(activeCommand == null) return null;
                    return activeCommand;
                }

                const getMousePosition = (activeCommand) => {
                    if(activeCommand == null) return null;
                    return activeCommand.currentMouseInput;
                }

                const getLastInput = (activeCommand) => { //TODO write this in the command class
                    if(activeCommand == null) return null;
                    if(activeCommand.input.length <= 0) return null;
                    return activeCommand.input[activeCommand.input.length-1];
                }

                if(splittedMessage.length != 1) return null;

                const amplitude = parseFloat(splittedMessage[0]);
                if(amplitude == null) return null;
                const activeCommand = getActiveCommand(commandManager);
                const mousePosition = getMousePosition(activeCommand);
                const lastInput = getLastInput(activeCommand); //TODO test for vector
                if(mousePosition == null || lastInput == null) return null;
                const amplitudedVector = getAmplitudedVector(lastInput, mousePosition, amplitude);
                if(amplitudedVector == null) return null;
                return [amplitudedVector.x, -amplitudedVector.y];
            }

            const getVectorFromTwoParsableStrings = (splittedMessage) => {
                if(splittedMessage.length != 2) return null;
                const values = [parseFloat(splittedMessage[0]),parseFloat(splittedMessage[1])];
                if(values[0] == null || values[1] == null) return null;
                return values;
            } 

            const getVectorFromString = (message, commandManager) => {
                if(message == null) return null;
                const splittedMessage = message.split(",");
                let values = getVectorFromTwoParsableStrings(splittedMessage);
                if(values == null) values = getVectorFromOneParsableString(splittedMessage, commandManager);
                if(values == null) return null;
                const parsedVector = new Vector(values[0], values[1]);
                return new Vector(parsedVector.x, -parsedVector.y);
            }

            const relativeVector = getVectorFromString(this.message, commandManager);
            this.message = "";
            if(relativeVector == null) return;
            if(commandManager == null) return;
            const activeCommand = commandManager.getLastObject();
            if(activeCommand == null) return;
            if(activeCommand.commandStatus != CommandStatus.OPEN) return;
            if(activeCommand.input.length <= 0) return;
            const lastInput = activeCommand.input[activeCommand.input.length-1];
            const absoluteVector = new Vector(lastInput.x+relativeVector.x, lastInput.y+relativeVector.y);
            activeCommand.input.push(absoluteVector);
            
            console.log("Calculated a relative input");
        }
        
        const ims = isMessageTextString(this.message);
        if(ims) executeCommandMessage(document, commandManager); else executeRelativeInputMessage(commandManager);
        return this;
    }

    executeLastCommand(commandManager){
        const previousCommand = commandManager.getLastObject();
        this.message = "";
        for(const previousCommand of commandManager.objects) previousCommand.cancel();
        if(previousCommand == null) return this;
        commandManager.addObject(previousCommand.duplicate());
        return this;
    }

    cancelLastCommand(commandManager){
        const activeCommand = commandManager.getLastObject();
        if(activeCommand == null) return this;
        if(activeCommand.commandStatus != CommandStatus.OPEN) return this;
        activeCommand.cancel();
        return this;
    }
}

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

//The cursor can translate mouse input to viewport input and handles objectsnapping

class Cursor {

    //Constructor

    constructor(vector, viewDimensions, viewScale) {
        this.screenPosition = vector;
        this.documentPosition = this.getDocumentPositionFromScreenPosition(viewDimensions, viewScale);
    }

    //Non-chainable methods

    getScreenPosition(){return this.screenPosition;}
    getDocumentPosition(){return this.documentPosition;}
    
    getDocumentPositionFromScreenPosition(viewDimensions, viewScale){
        const topLeftViewCorner = new Vector(viewDimensions[0][0], viewDimensions[0][1]);
        const relativeScaleMousePosition = new Vector(this.screenPosition.x*viewScale, this.screenPosition.y*viewScale);
        const newDocumentPosition = new Vector(topLeftViewCorner.x + relativeScaleMousePosition.x, topLeftViewCorner.y + relativeScaleMousePosition.y);
        return newDocumentPosition;
    }

    getScreenPositionFromDocumentPosition(viewDimensions, viewScale){
        const topLeftViewCorner = new Vector(viewDimensions[0][0], viewDimensions[0][1]);
        const relativeMousePosition = new Vector(this.documentPosition.x - topLeftViewCorner.x, this.documentPosition.y - topLeftViewCorner.y);
        const newScreenPosition = new Vector(relativeMousePosition.x/viewScale, relativeMousePosition.y/viewScale);
        return newScreenPosition;
    }

    getSnappedVector(document, activeCommand, vector){
        const getReferencePointSnap = () => document.getReferencePointOnPoint(vector, 5);

        const getCommandInputSnap = (activeCommand, viewScale) => 
        {
            const getVectorInput = (input) => {
                let filteredInput = [];
                for(let i of input) if(i instanceof Vector) filteredInput.push(i);
                return filteredInput;
            }

            const getClosestVectorInput = (inputArray, inputVector) => { //TODO change to smallest angle towards

                const getDistanceBetweenPoints = (a,b) => {
                    const twoPointVector = new Vector(b.x-a.x, b.y-a.y);
                    const distance = Math.pow(Math.pow(twoPointVector.x,2)+Math.pow(twoPointVector.y,2),0.5);
                    return distance;
                }

                const getInputOnPoint = (inputArray,point,tolerance) => {
                    for(const input of inputArray)
                    {
                        if(getDistanceBetweenPoints(input, point) >= tolerance) continue;
                        return input;
                    }
                    return null;
                }

                if(inputArray.length <= 0) return null;
                const inputOnPoint = getInputOnPoint(inputArray, inputVector, 5);
                if(inputOnPoint != null) return inputOnPoint;

                return inputArray[inputArray.length-1];
            }

            if(activeCommand == null) return null;
            if(activeCommand.commandStatus != CommandStatus.OPEN) return null;
            if(activeCommand.input.length == 0) return null;
            let vectorInput = getVectorInput(activeCommand.input);
            let newVector = new Vector(vector.x, vector.y);
            const referenceInput = getClosestVectorInput(vectorInput, newVector);
            if(referenceInput == null) return null;
            const tolerance = 5; //TODO clean
            if(Math.abs(newVector.x-referenceInput.x) < tolerance) newVector.x = referenceInput.x;
            if(Math.abs(newVector.y-referenceInput.y) < tolerance) newVector.y = referenceInput.y;
            if(newVector.x == vector.x && newVector.y == vector.y) return null;
            return newVector;
        };

        //Snap to reference point
        let referencePointSnap = getReferencePointSnap();
        if(referencePointSnap != null) return referencePointSnap;
        let commandInputSnap = getCommandInputSnap(activeCommand);
        if(commandInputSnap != null) return commandInputSnap;
        //TODO test function thingy
            //check if the command is null
            //check if the command is opened
            //get the first vector of the input
            //if there is one, return that one
        //90 degrees
            //see if the x or y is less than tolerance
            //if so, return the corrected tolerance

        return vector;
    }

    //Chainable methods

    update(document, activeCommand, vector, viewDimensions, viewScale){ //TODO create object
        this.screenPosition = vector; //TODO Set screen position from current vector
        this.documentPosition = this.getDocumentPositionFromScreenPosition(viewDimensions, viewScale); //TODO Convert the vector to documentposition
        this.documentPosition = this.getSnappedVector(document, activeCommand, this.documentPosition, viewScale); //TODO change when camera zoom comes in
        this.screenPosition = this.getScreenPositionFromDocumentPosition(viewDimensions, viewScale);
        return this;
    }
}

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

class Theme {

    //Constructor

    constructor() {
        this.currentSettings = DIGITAL_RENAISSANCE_THEME_SETTINGS;
        this.setDefaultSettings().setCurrentSettings();
    }

    //Non-chainable methods

    getThemeName(){return this.themeName};

    getVectorSettings(){ 
        return {
            fillColor: this.vectorFillColor
        };
    };

    getCommandBarSettings(){ 
        return {
            fillColor: this.commandBarFillColor,
            textColor: this.commandBarTextColor
        };
    };

    getCursorSettings(){
        return {
            strokeColor: this.cursorStrokeColor,
            strokeWeight: this.cursorStrokeWeight
        };
    };

    getViewSettings(){
        return {
            backgroundColor: this.viewBackgroundColor,
            regularElementsStrokeColor: this.viewRegularElementsStrokeColor,
            regularElementsStrokeWeight: this.viewRegularElementsStrokeWeight,
            hoverElementsStrokeColor: this.viewHoverElementsStrokeColor,
            hoverElementsStrokeWeight: this.viewHoverElementsStrokeWeight,
            commandElementsStrokeColor: this.viewCommandElementsStrokeColor,
            commandElementsStrokeWeight: this.viewCommandElementsStrokeWeight
        };
    };

    //Chainable methods

    setDefaultSettings(){
        this.themeName = "Default Theme";
        this.vectorFillColor = "#ffffff";
        this.commandBarFillColor = "#282828";
        this.commandBarTextColor = "#ffffff";
        this.cursorStrokeColor = "#ffffff";
        this.cursorStrokeWeight = 2;
        this.viewBackgroundColor = "#000000";
        this.viewRegularElementsStrokeColor = "#ffffff";
        this.viewRegularElementsStrokeWeight = 2;
        this.viewHoverElementsStrokeColor = "#505050";
        this.viewHoverElementsStrokeWeight = 2;
        this.viewCommandElementsStrokeColor = "#ffffff";
        this.viewCommandElementsStrokeWeight = 2;
        return this;
    }

    setCurrentSettings(){
        const content = JSON.parse(this.currentSettings)[0];
        this.themeName = content.themeName;
        this.vectorFillColor = content.vectorFillColor;
        this.commandBarFillColor = content.commandBarFillColor;
        this.commandBarTextColor = content.commandBarTextColor;
        this.cursorStrokeColor = content.cursorStrokeColor;
        this.cursorStrokeWeight = content.cursorStrokeWeight;
        this.viewBackgroundColor = content.viewBackgroundColor;
        this.viewRegularElementsStrokeColor = content.viewRegularElementsStrokeColor;
        this.viewRegularElementsStrokeWeight = content.viewRegularElementsStrokeWeight;
        this.viewHoverElementsStrokeColor = content.viewHoverElementsStrokeColor;
        this.viewHoverElementsStrokeWeight = content.viewHoverElementsStrokeWeight;
        this.viewCommandElementsStrokeColor = content.viewCommandElementsStrokeColor;
        this.viewCommandElementsStrokeWeight = content.viewCommandElementsStrokeWeight;
        return this;
    }
}

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

//The view combines all items to render

class View {

    //Constructor

    constructor(canvasDimensions) //TODO delete the dimensions
    {

        this.canvasDimensions = canvasDimensions; //TODO clean this up

        //TODO define as top left and bottom right corner
        this.viewDimensions = [
            [parseFloat(0), parseFloat(0)],
            [parseFloat(canvasDimensions[0]), parseFloat(canvasDimensions[1])]
        ];
        this.viewScale = 1.0;
        //this.viewCenter = new Vector(canvasDimensions[0]*0.5,canvasDimensions[1]*0.5); //TODO make this a zero vector
    
        this.cursor = new Cursor(new Vector(), this.viewDimensions, this.viewScale);
        this.commandBar = new CommandBar();
        this.theme = new Theme();
    }

    //Non-chainable methods

    getViewDimensionsScale(){return (this.viewDimensions[1][0]-this.viewDimensions[0][0])/this.canvasDimensions[0];}

    //Chainable methods

    changeViewScale(delta, factor){
        if(this.viewScale <= 0.1 && (delta*factor) <= 0) return this; //TODO set limit
        if(this.viewScale >= 10 && (delta*factor) >= 0) return this; //TODO set limit
        this.viewScale = Math.abs(this.viewScale+(delta*factor));
        return this;
    }
    
    setViewDimensions(){
        const getMultipliedVectorByScaleOrigin = (v,o,s) => {
            const getTranslatedVector = (a,b) => [a[0]+b[0], a[1]+b[1]];
            const getMultipliedVector = (a,f) => [a[0]*f, a[1]*f];
            const getReversedVector = (a) => [a[0]*-1, a[1]*-1];

            let vector = v;
            vector = getTranslatedVector(vector,getReversedVector(o));
            vector = getMultipliedVector(vector,s);
            vector = getTranslatedVector(vector, o);
            const multipliedVector = vector;
            return multipliedVector;
        }

        const getMultipliedVectorArrayByScaleOrigin = (array, origin, factor) => [ //TODO make this pretty
            getMultipliedVectorByScaleOrigin(array[0], origin, factor),
            getMultipliedVectorByScaleOrigin(array[1], origin, factor)
        ]

        const scaleOrigin = [this.cursor.documentPosition.x, this.cursor.documentPosition.y];
        this.viewDimensions = getMultipliedVectorArrayByScaleOrigin(this.viewDimensions, scaleOrigin, 1/this.getViewDimensionsScale()); //scale the viewdimensions to the canvas size
        this.viewDimensions = getMultipliedVectorArrayByScaleOrigin(this.viewDimensions, scaleOrigin, this.viewScale); //then scale the canvas to the new viewscale size
        return this;
    }

    update(document, activeCommand, vector, canvasDimensions){
        this.canvasDimensions = canvasDimensions;
        this.setViewDimensions();
        this.cursor.update(document, activeCommand, vector, this.viewDimensions, this.getViewDimensionsScale());
        return this;
    }

    addCommandBarMessage(document, commandManager, message){
        this.commandBar.addMessage(document, commandManager, message);
        return this;
    }
}

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

//General manager class

class Manager {

    //Constructor

    constructor(objects, bufferSize) {
        this.objects = objects;
        this.activeObjectIndex = 0;
        this.bufferSize = bufferSize;
        if(bufferSize <= 0) this.bufferSize = 1000;
        if(objects === undefined) this.objects = [];
        if(bufferSize === undefined) this.bufferSize = 1000;
    }

    //Non-chainable methods

    getActiveObject(){
        if(this.objects.length <= 0) return null;
        if(this.activeObjectIndex >= this.objects.length) this.activeObjectIndex %= this.object.length;
        return this.objects[this.activeObjectIndex];
    };

    getLastObject(){
        if(this.objects.length <= 0) return null;
        return this.objects[this.objects.length-1];
    }

    //Chainable methods

    addObject(object){
        this.objects.push(object);
        if(this.bufferSize >= 0) return this;
        if(this.objects.length > this.bufferSize) this.objects.shift();
        return this;
    }

    clear(){
        this.objects = [];
        return this;
    };

    //TODO increase index

    //TODO decrease index
}

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

//---------------------------------------------
//Extension: Core
//Vanilla Commands: Adds basic drawing commands
//---------------------------------------------

Commands.debug = function(document) { 
    return new Command(
        document, "debug",
        () => true,
        () => console.log("debug: this is a debug message"),
        () => null
    );
}

Commands.line = function(document) {
    return new Command(
        document, "line",
        function(){
            //if(this.input.length == 0) this.log("set start point");
            //if(this.input.length == 1) this.log("set end point");
            if(this.input.length < 2) return false; 
            return true;
        },
        function(){this.document.addElement(Elements.line(this.input[0],this.input[1]));},
        function(){
            if(this.input.length!=1) return;
            const l = new Line(this.input[0],this.currentMouseInput);
            //stroke(255); strokeWeight(2); noFill();
            l.render();
        }
    );
}

Commands.circle = function(document) {
    return new Command(
        document, "circle",
        function(){
            //if(this.input.length == 0) this.log("set center point");
            //if(this.input.length == 1) this.log("set radius");
            if(this.input.length < 2) return false; 
            return true;
        },
        function(){
            const l = new Circle(this.input[0],1);
            l.referencePoints[1] = this.input[1];
            l.rebuild();
            this.document.addElement(Elements.circle(l.centerPoint,l.radius));
        },        
        function(){
            if(this.input.length!=1) return;
            let l = new Circle(this.input[0],1);
            l.referencePoints[1] = this.currentMouseInput;
            l.rebuild();
            //stroke(255); strokeWeight(2); noFill();
            l.render();
        }
    );
}

Commands.polyline = function(document) {
    return new Command(
        document, "polyline",
        function(){
            //TODO check for first merge and last merge
            const getLastPoint = (array, offset) => array[array.length-1-offset];
            const pointsCollide = (a,b) => {if(a.x == b.x && a.y == b.y) return true; return false;} //TODO check if tolerance if important
            //this.log("set vertex point");
            if(this.input.length < 3) return false;
            let isPolyLineClosed = null;
            if(pointsCollide(this.input[0], getLastPoint(this.input, 0))) isPolyLineClosed = true;
            if(pointsCollide(getLastPoint(this.input, 1), getLastPoint(this.input, 0))) isPolyLineClosed = false;
            if(isPolyLineClosed == null) return false; //TODO add closed property
            return true;
        },
        function(){
            const isPolyLineClosed = (inputArray) => {
                const getLastPoint = (array, offset) => array[array.length-1-offset];
                const pointsCollide = (a,b) => {if(a.x == b.x && a.y == b.y) return true; return false;} //TODO check if tolerance if important
                if(pointsCollide(inputArray[0], getLastPoint(inputArray, 0))) return true;
                return false;
            }
            this.document.addElement(Elements.polyline(this.input,isPolyLineClosed(this.input)));
        },
        function(){
            if(this.input.length == 0) return;
            let tempInput = [];
            for(let i of this.input) tempInput.push(i);
            tempInput.push(this.currentMouseInput);
            const l = new PolyLine(tempInput);
            l.render();
        }
    );
}

Commands.rectangle = function(document) {
    return new Command(
        document, "rectangle",
        function(){
            if(this.input.length < 2) return false;
            return true;
        },
        function(){
            const getCornerVectors = (a,b) => [new Vector(a.x,a.y), new Vector(a.x, b.y), new Vector(b.x, b.y), new Vector(b.x, a.y)];
            this.document.addElement(Elements.polyline(getCornerVectors(this.input[0], this.input[1]), true));
        },
        function(){
            const getCornerVectors = (a,b) => [new Vector(a.x,a.y), new Vector(a.x, b.y), new Vector(b.x, b.y), new Vector(b.x, a.y)];
            if(this.input.length == 0) return;
            const l = new PolyLine(getCornerVectors(this.input[0], this.currentMouseInput), true);
            //stroke(255); strokeWeight(2); noFill();
            l.render();
        } //TODO make it visible when just on input has been drawn
    );
}

Commands.movereferencepoint = function(document) {
    return new Command(
        document, "movereferencepoint",
        function() {
            if(this.input.length == 0) return false;
            if(this.input[0] instanceof Vector){ //Make false
                referencePoint = this.document.getReferencePointOnPoint(this.input[0], 5);
                if(referencePoint == null) {this.input = []; return false;} //This makes it a class
                this.input = [null, referencePoint]; //this also makes it a class
            }
            if(this.input.length < 3) return false;
            return true;
        },
        function() {
            this.input[1].x = this.input[2].x;
            this.input[1].y = this.input[2].y;
        },
        function() {
        } //TODO find a way to display it
    );
}

Commands.delete = function(document) {
    return new Command(
        document, "delete",
        () => true,
        function() {
            let elements = this.document.getElementsOnPoint(new Vector(mouseX, mouseY), 5); //TODO make this cursor input
            if(elements == null) return;
            elements[0].geometry = null; //TODO correct
            let cleanedElements = [];
            for(let e of this.document.elements) if(e.geometry != null) cleanedElements.push(e); //TODO remove object cleaner
            this.document.elements = cleanedElements;
        },
        () => null
    );
}

Commands.save = function(document) {
    return new Command(
        document, "save",
        () => true,
        () => File.save(document),
        () => null
    );
}

Commands.open = function(document) {
    return new Command(
        document, "open",
        () => true,
        () => File.open((content) => document.elements = File.getDocumentFromString(content).elements), //replace current document with document
        () => null
    );
}

Commands.new = function(document) {
    return new Command(
        document, "new",
        () => true,
        () => document.clear(),
        () => null
    );    
}

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

//----------------------------------
//Extension: Additional
//Website Loader: Opens online tools
//----------------------------------

// Loads external websites

const WebsiteLoader = {
    loadURL: (url, phoneResolution) => {
        if(phoneResolution){window.open(url,"_blank", "width=480,height=800");return;}
        window.open(url,"_blank");
    }
}

//Online tools

Commands.googledrive = function(document){
    return new Command(
    document, "googledrive",
    () => true,
    () => WebsiteLoader.loadURL("http://drive.google.com", true),
    () => null
    );
}

Commands.dropbox = function(document){
    return new Command(
    document, "dropbox",
    () => true,
    () => WebsiteLoader.loadURL("http://www.dropbox.com", true),
    () => null
    );
}

Commands.trello = function(document){
    return new Command(
    document, "trello",
    () => true,
    () => WebsiteLoader.loadURL("http://www.trello.com", true),
    () => null
    );
}

Commands.google = function(document){
    return new Command(
    document, "google",
    () => true,
    () => WebsiteLoader.loadURL("http://www.google.com", true),
    () => null
    );
}

//Inspirational websites

Commands.archdaily = function(document){
    return new Command(
    document, "archdaily",
    () => true,
    () => WebsiteLoader.loadURL("http://www.archdaily.com", true),
    () => null
    );
}

Commands.dezeen = function(document){
    return new Command(
    document, "dezeen",
    () => true,
    () => WebsiteLoader.loadURL("http://www.dezeen.com", true),
    () => null
    );
}

//Recreational websites

Commands.youtube = function(document){
    return new Command(
    document, "youtube",
    () => true,
    () => WebsiteLoader.loadURL("http://www.youtube.com", true),
    () => null
    );
}

Commands.spotify = function(document){
    return new Command(
    document, "spotify",
    () => true,
    () => WebsiteLoader.loadURL("http://www.spotify.com", true),
    () => null
    );
}

//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

//----------------------------------
//Extension: Additional
//Arrow: Adds moving arrows
//----------------------------------

class Arrow extends Element{

    //Constuctor
    constructor(geometry, startPoint, endPoint){
        super(geometry);

        this.frame = 0;
        this.frameLimit = 100;
    }

    //Chainable methods
    rebuild(cursorDocumentPosition){
        for(const GEOMETRY of this.geometry) GEOMETRY.rebuild(cursorDocumentPosition);
        this.frame++;
        if(this.frame >= this.frameLimit) this.frame = 0; 
        return this;
    }

    render(){

        const GET_UNIT_DIRECTION_VECTOR = () => {

            const GET_UNIT_VECTOR = (vector) => {
                const GET_VECTOR_LENGTH = (vector) => Math.pow(Math.pow(vector.x,2)+Math.pow(vector.y,2),0.5);
                const GET_DIVIDED_VECTOR = (vector, factor) => new Vector(vector.x/factor, vector.y/factor);
                return GET_DIVIDED_VECTOR(vector, GET_VECTOR_LENGTH(vector));
            }

            const GET_DIRECTION = () => new Vector(
                this.geometry[0].endPoint.x-this.geometry[0].startPoint.x,
                this.geometry[0].endPoint.y-this.geometry[0].startPoint.y
            );

            return GET_UNIT_VECTOR(GET_DIRECTION());
        }

        const GET_ROTATED_VECTOR = (vector) => new Vector(vector.y,-vector.x);

        const BASE_POINT = new Vector(
            map(this.frame,0,this.frameLimit, this.geometry[0].startPoint.x, this.geometry[0].endPoint.x),
            map(this.frame,0,this.frameLimit, this.geometry[0].startPoint.y, this.geometry[0].endPoint.y)
        );

        const UNIT_DIRECTION_VECTOR = GET_UNIT_DIRECTION_VECTOR();

        const BACK_POINT = new Vector(
            BASE_POINT.x - UNIT_DIRECTION_VECTOR.x*20,
            BASE_POINT.y - UNIT_DIRECTION_VECTOR.y*20
        );

        const LEFT_POINT = new Vector(
            BACK_POINT.x + GET_ROTATED_VECTOR(UNIT_DIRECTION_VECTOR, this.geometry[0].startPoint).x*10,
            BACK_POINT.y + GET_ROTATED_VECTOR(UNIT_DIRECTION_VECTOR, this.geometry[0].startPoint).y*10
        );

        const RIGHT_POINT = new Vector(
            BACK_POINT.x - GET_ROTATED_VECTOR(UNIT_DIRECTION_VECTOR, this.geometry[0].startPoint).x*10,
            BACK_POINT.y - GET_ROTATED_VECTOR(UNIT_DIRECTION_VECTOR, this.geometry[0].startPoint).y*10
        );

        fill(255,255,255);
        beginShape();
        vertex(LEFT_POINT.x, LEFT_POINT.y);
        vertex(RIGHT_POINT.x, RIGHT_POINT.y);
        vertex(BASE_POINT.x, BASE_POINT.y);
        endShape(CLOSE);
        noFill();
        
        return this;
    }
}

Commands.arrow = function(document) { 
    return new Command(
        document, "arrow",
        function(){
            if(this.input.length < 2) return false; 
            return true;
        },
        function(){this.document.addElement(new Arrow([new Line(this.input[0],this.input[1])]));},
        function(){
            if(this.input.length!=1) return;
            const l = new Line(this.input[0],this.currentMouseInput);
            l.render();
        }
    );
}



//-------------------------------------------------------
//PAGE TRANSIT
//-------------------------------------------------------

//Render functions depend on P5js
//They add render functions to other elements

//Database

Vector.prototype.render = function(viewScale, settings) {
    if(viewScale === undefined) viewScale = 1;
    noStroke();
    fill(settings.fillColor);
    rectMode(CENTER);
    rect(this.x, this.y,5/viewScale,5/viewScale);
    return this;
 }
 
 Geometry.prototype.render = function() {
    return this;
 }
 
 Arc.prototype.render = function() {
    //TODO define arc function
    return this;
 }
 
 Circle.prototype.render = function(){
    ellipse(this.centerPoint.x, this.centerPoint.y, this.radius*2, this.radius*2);
    return this;
 }
 
 Line.prototype.render = function() {
    line(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
    return this;
 }
 
 PolyLine.prototype.render = function() {
    beginShape();
    for(let v of this.vertices) vertex(v.x,v.y);
    if(this.isClosed) endShape(CLOSE); else endShape();
    return this;
 }
 
 Ray.prototype.render = function() {
    //TODO define prototype
    return this;
 }
 
 Element.prototype.render = function() {
    for(let g of this.geometry) g.render();
    return this;
 }
 
 Document.prototype.render = function() {
    for(let e of this.elements) e.render();
    return this;
 }
 
 //Interface
 
 Cursor.prototype.render = function(settings){
 
    const removeDefaultCursor = () => noCursor();
 
    const renderCursor = (settings) => {
       stroke(settings.strokeColor);
       strokeWeight(settings.strokeWeight);
       noFill();
       ellipse(this.screenPosition.x, this.screenPosition.y,10,10); //TODO make this screen position
    }
    
    removeDefaultCursor();
    renderCursor(settings);
    return this;
 }
 
 //Commandbar
 
 CommandBar.prototype.render = function(position, activeCommand, settings) {
 
    const getDimensionsFromMessage = (message) => {
       const dimensions = new Vector(100,20);
       dimensions.x = 10+(textWidth(message));
       return dimensions;
    }
 
    const getCommandBarMessage = (commandBarMessage, activeCommand) => {
       if(commandBarMessage.length > 0) return commandBarMessage;
       if(activeCommand == null) return null;
       if(activeCommand.commandStatus != CommandStatus.OPEN) return null;
       //if(activeCommand.message.length > 0) activeCommand.message; //TODO activate
       return null;
    }
 
    const renderBoundary = (position, dimensions, offset, border, settings) => {
       noStroke();
       fill(settings.fillColor);
       rectMode(CORNERS);
       rect(
          position.x+(dimensions.x+offset+(border*2)), 
          position.y-offset,
          position.x+offset, 
          position.y-(dimensions.y+offset+(border*2))
       ); 
       //TODO remove the part in the middle of the cursor
    }
 
    const renderMessage = (message, position, offset, border, settings) => {
          textSize(12);
          fill(settings.textColor);
          noStroke();
          text(message, position.x + offset+5+border, position.y - (offset+5+border));
    }
 
    const message = getCommandBarMessage(this.message, activeCommand); //TODO add active command
    if(message == null) return;
    const offset = 0; //TODO rename
    const border = 3;
    const dimensions = getDimensionsFromMessage(message);
    renderBoundary(position, dimensions, offset, border, settings);
    renderMessage(message, position, offset, border, settings);
    return this;
 }
 
 View.prototype.render = function(activeDocument, activeCommand) {
 
    const renderEnvironment = (settings) => {
       background(settings.backgroundColor);
       smooth(8);
    }
 
    const renderRegularElements = (activeDocument, viewScale, settings) => {
       noFill();
       stroke(settings.regularElementsStrokeColor);
       strokeWeight(settings.regularElementsStrokeWeight/viewScale);
       activeDocument.render();
    }
 
    const renderActiveHover = (view, activeDocument, viewScale, settings) => {
       for(let element of activeDocument.getElementsOnPoint(view.cursor.documentPosition,5/viewScale)) 
       {
          noFill();
          stroke(settings.hoverElementsStrokeColor);
          strokeWeight(settings.hoverElementsStrokeWeight/viewScale);
          element.render();
          for(let g of element.geometry) for(let v of g.referencePoints) v.render(viewScale, this.theme.getVectorSettings()); //TODO v.render is not a function
       }
    }
 
    const renderCursor = (view, activeCommand) => {
       view.commandBar.render(this.cursor.screenPosition, activeCommand, this.theme.getCommandBarSettings()); //TODO chance to screen position
       view.cursor.render(this.theme.getCursorSettings());
    }
 
    const renderActiveCommand = (activeCommand, viewScale, settings) => {
       if(activeCommand == null) return;
       if(activeCommand.commandStatus != CommandStatus.OPEN) return;
       if(activeCommand.render === undefined) return;
       noFill();
       stroke(settings.commandElementsStrokeColor);
       strokeWeight(settings.commandElementsStrokeWeight/viewScale);
       activeCommand.render();
    }
 
    const viewScale = 1/this.getViewDimensionsScale();
    const viewScaleOrigin = [this.viewDimensions[0][0], this.viewDimensions[0][1]];
 
    push();
    scale(viewScale);
    translate(-viewScaleOrigin[0], -viewScaleOrigin[1]);
    renderEnvironment(this.theme.getViewSettings());
    renderRegularElements(activeDocument, viewScale, this.theme.getViewSettings());
    renderActiveHover(this, activeDocument, viewScale, this.theme.getViewSettings());
    renderActiveCommand(activeCommand, viewScale, this.theme.getViewSettings());
    pop();
    renderCursor(this, activeCommand);
    return this;
 }