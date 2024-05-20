//----------------------------------
//Extension: Additional
//Catanary: Adds a catanary line
//----------------------------------

class Catenary extends Element {

    //Constuctor
    constructor(geometry, startPoint, endPoint) {
        super(geometry);
    }

    rebuild(cursorDocumentPosition) {
        for (const GEOMETRY of this.geometry) GEOMETRY.rebuild(cursorDocumentPosition);
        return this;
    }

    render() {
        const exp = (x) => Math.exp(x);
    
        // Corrected cosh function
        const cosh = (x) => (exp(x) + exp(-x)) * 0.5;
    
        const MAGNITUDE = 100; // Random value for the catenary, in pixels
    
        this.geometry[0].endPoint.y = this.geometry[0].startPoint.y;

        const START_POINT = new Vector(this.geometry[0].startPoint.x, this.geometry[0].startPoint.y);
        const END_POINT = new Vector(this.geometry[0].endPoint.x, this.geometry[0].endPoint.y);
    
        const DISTANCE_VECTOR = new Vector(
            END_POINT.x - START_POINT.x,
            END_POINT.y - START_POINT.y
        );
    
        const xMid = (START_POINT.x + END_POINT.x) * 0.5;
        const yMid = (START_POINT.y + END_POINT.y) * 0.5;
    
        // Define a catenary function that respects the y positions of the start and end points
        const catenary = (x) => {
            const c = (START_POINT.y + END_POINT.y) / 2 - MAGNITUDE * cosh((DISTANCE_VECTOR.x / 2) / MAGNITUDE);
            const y = MAGNITUDE * cosh((x - xMid) / MAGNITUDE) + c;
            return y;
        };
    
        noFill();
        beginShape();
    
        for (let x = START_POINT.x; x <= END_POINT.x; x += 1) {
            let y = catenary(x);
            vertex(x, y);
        }
    
        endShape();
    }
    


}

Commands.catenary = function (document) {
    return new Command(
        document, "catenary",
        function () {
            if (this.input.length < 2) return false;
            return true;
        },
        function () { this.document.addElement(new Catenary([new Line(this.input[0], this.input[1])])); },
        function () {
            if (this.input.length != 1) return;
            const l = new Line(this.input[0], this.currentMouseInput);
            l.render();
        }
    );
}