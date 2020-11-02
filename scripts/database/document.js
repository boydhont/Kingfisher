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