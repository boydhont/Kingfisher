class Hatch extends Element{
    constructor(geometry, vertices, isClosed){
        super(geometry);
    }

    rebuild(cursorDocumentPosition) {
        for (const GEOMETRY of this.geometry) GEOMETRY.rebuild(cursorDocumentPosition);
        return this;
    }

    render(){
        fill(255,255,255);
        beginShape();
        for(const v of this.geometry[0].vertices) vertex(v.x, v.y);
        endShape(CLOSE);
        noFill();
    }
}

Commands.hatch = function (document) {
    return new Command(
        document, "hatch",
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
            this.document.addElement(new Hatch([new PolyLine(this.input, true)]));
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