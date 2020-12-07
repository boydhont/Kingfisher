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
            const getCornerVectors = (a,b) => [new Vector(a.x,a.y), new Vector(a.x, b.y), new Vector(b.x, b.y), new Vector(b.x, a.y)]; //TODO error here
            if(this.input.length == 0) return;
            if(this.input[0] == null) return;
            if(this.currentMouseInput == null) return;
            const l = new PolyLine(getCornerVectors(this.input[0], this.currentMouseInput), true);
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