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