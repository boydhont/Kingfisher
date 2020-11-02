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