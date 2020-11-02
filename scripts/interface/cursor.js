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