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