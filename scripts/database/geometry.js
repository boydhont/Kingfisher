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