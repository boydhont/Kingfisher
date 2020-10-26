//General manager class

class Manager {

    //Constructor

    constructor(objects, bufferSize) {
        this.objects = objects;
        this.activeObjectIndex = 0;
        this.bufferSize = bufferSize;
        if(bufferSize <= 0) this.bufferSize = 1000;
        if(objects === undefined) this.objects = [];
        if(bufferSize === undefined) this.bufferSize = 1000;
    }

    //Non-chainable methods

    getActiveObject = () => {
        if(this.objects.length <= 0) return null;
        if(this.activeObjectIndex >= this.objects.length) this.activeObjectIndex %= this.object.length;
        return this.objects[this.activeObjectIndex];
    };

    getLastObject = () => {
        if(this.objects.length <= 0) return null;
        return this.objects[this.objects.length-1];
    }

    //Chainable methods

    addObject = (object) => {
        this.objects.push(object);
        if(this.objects.length > this.bufferSize) this.objects.shift();
        return this;
    }

    clear = () => {
        this.objects = [];
        return this;
    };

    //TODO increase index

    //TODO decrease index
}