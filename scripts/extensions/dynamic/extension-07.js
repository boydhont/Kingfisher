//Line

class GuideLine extends Element{
    constructor(geometry, startPoint, endPoint){
        super(geometry);
    }

    rebuild(cursorDocumentPosition) {
        for (const GEOMETRY of this.geometry) GEOMETRY.rebuild(cursorDocumentPosition);
        return this;
    }

    render(){}
}

Commands.guideline = function (document) {
    return new Command(
        document, "guideline",
        function () {
            if (this.input.length < 2) return false;
            return true;
        },
        function () { this.document.addElement(new GuideLine([new Line(this.input[0], this.input[1])])); },
        function () {
            if (this.input.length != 1) return;
            const l = new Line(this.input[0], this.currentMouseInput);
            l.render();
        }
    );
}

//Polyline

class GuidePolyLine extends Element{
    constructor(geometry, vertices, isClosed){
        super(geometry);
    }

    rebuild(cursorDocumentPosition) {
        for (const GEOMETRY of this.geometry) GEOMETRY.rebuild(cursorDocumentPosition);
        return this;
    }

    render(){}
}

Commands.guidepolyline = function (document) {
    return new Command(
        document, "guidepolyline",
        function () {
            //TODO check for first merge and last merge
            const getLastPoint = (array, offset) => array[array.length - 1 - offset];
            const pointsCollide = (a, b) => { if (a.x == b.x && a.y == b.y) return true; return false; } //TODO check if tolerance if important
            //this.log("set vertex point");
            if (this.input.length < 3) return false;
            let isPolyLineClosed = null;
            if (pointsCollide(this.input[0], getLastPoint(this.input, 0))) isPolyLineClosed = true;
            if (pointsCollide(getLastPoint(this.input, 1), getLastPoint(this.input, 0))) isPolyLineClosed = false;
            if (isPolyLineClosed == null) return false; //TODO add closed property
            return true;
        },
        function () {
            const isPolyLineClosed = (inputArray) => {
                const getLastPoint = (array, offset) => array[array.length - 1 - offset];
                const pointsCollide = (a, b) => { if (a.x == b.x && a.y == b.y) return true; return false; } //TODO check if tolerance if important
                if (pointsCollide(inputArray[0], getLastPoint(inputArray, 0))) return true;
                return false;
            }
            this.document.addElement(new GuidePolyLine([new PolyLine(this.input, isPolyLineClosed(this.input))]));
        },
        function () {
            if (this.input.length == 0) return;
            let tempInput = [];
            for (let i of this.input) tempInput.push(i);
            tempInput.push(this.currentMouseInput);
            const l = new PolyLine(tempInput);
            l.render();
        }
    );
}