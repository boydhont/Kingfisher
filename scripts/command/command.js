//The commandStatus enum

const CommandStatus = {OPEN: "Command open", CLOSED: "Command closed", CANCELED: "Command canceled"};

//The base command class

class Command
{

    //Constructor

    constructor(document, name, condition, execute, render) //TODO make this object
    {
        this.message = "";
        this.document = document;
        this.name = name;
        this.condition = condition;
        this.execute = execute;
        this.commandStatus = CommandStatus.OPEN;
        this.input = [];
        this.currentMouseInput = null;
        this.render = render;
        if(name === undefined) this.name = "";
        if(condition === undefined) this.condition = new function(){};
        if(execute === undefined) this.condition = new function(){};
        if(render === undefined) this.render = new function(){}
    }

    //Non-chainable methods

    duplicate(){return new Command(this.document, this.name, this.condition, this.execute, this.render);}

    //Chainable methods

    run(currentMouseInput){
        if(this.commandStatus != CommandStatus.OPEN) return this;
        this.currentMouseInput = currentMouseInput;
        //this.render(); //TODO insert view here
        if(this.condition() == false) return this;
        this.execute(this.document);
        this.message = "";
        this.commandStatus = CommandStatus.CLOSED;
        return this;
    };

    addInput(input){
        if(this.commandStatus != CommandStatus.OPEN) return;
        this.input.push(input);
        return this;
    }

    cancel(){
        if(this.commandStatus != CommandStatus.OPEN) return this; 
        this.commandStatus = CommandStatus.CANCELED;
        console.log(this.name + this.commandStatus);
        return this;
    }

    log(message){
        this.message = message
        return this;
    };
}

//Commands retriever
function getCommands(document, message)
{
    for(let f in Commands) if(f == message) return Commands[f](document);
    return null;
}

//Commands array
let Commands = {};