//The commandbar takes an input string and converts it to a string message

class CommandBar {

    //Constructor

    constructor() {
        this.message = "";
    }

    //Non-chainable methods
    
    isMessageRelativeInputCommand = (commandManager, input, message) => {
        const isActiveCommandFitForRelativeInput = (commandManager) => {
            const activeCommand = commandManager.getLastObject();
            if(activeCommand == null) return false;
            if(activeCommand.commandStatus != CommandStatus.OPEN) return false;
            if(activeCommand.input <= 0) return false;
        }

        const isMessageNewTextCommand = (input, message) => {
            if(message.length <= 0 && input.toLowerCase() != input.toUpperCase()) return true;
            return false;
        }

        const isMessageExtendedTextCommand = (input, message) => {
            if(message.toUpperCase() == message.toLowerCase()) return false;
            if(input.toUpperCase() == input.toLowerCase()) return false;
            return true;
        }

        if(isActiveCommandFitForRelativeInput(commandManager) == false) return false;
        if(isMessageNewTextCommand(input, message)) return false;
        if(isMessageExtendedTextCommand(input, message)) return false;
        return true;
    }

    getExtendedMessage = (message, input, isMessageRelativeInputCommand) => {

        const getExtendedTextMessage = (message, input) => {
            if(input.toLowerCase() == input.toUpperCase()) return message;
            return message + input.toLowerCase();
        }

        const getExtendedRelativeInputMessage = (message, input) => {
            if(isNaN(input) && input != "," && input != "." && input != "-") return message;
            if(input.toLowerCase() != input.toUpperCase()) message = "";
            return message + input;
        }

        if(input.length != 1) return message;
        if(isMessageRelativeInputCommand == false) message = getExtendedTextMessage(message, input);
        if(isMessageRelativeInputCommand) message = getExtendedRelativeInputMessage(message,input);
        return message;
    }

    //Chainable methods

    addMessage = (document, commandManager, input) => {
        //TODO add spacebar trigger
        if(input === undefined || input == null) return;
        if(input == " ") this.executeLastCommand(commandManager);
        if(input == "Escape") this.cancelLastCommand(commandManager);
        if(input == "Backspace" && this.message.length > 0) this.message = this.message.substring(0,this.message.length-1);
        if(input == "Enter") this.executeMessage(document, commandManager);
        const isMessageRelativeInputCommand = this.isMessageRelativeInputCommand(commandManager, input, this.message);
        this.message = this.getExtendedMessage(this.message, input, isMessageRelativeInputCommand);
        return this;
    };

    executeMessage = (document, commandManager) => {

        const isMessageTextString = (message) => {if(message.toUpperCase() != message.toLowerCase()) return true; return false}

        const executeCommandMessage = (document, commandManager) => {
            const command = getCommands(document, this.message);
            this.message = "";
            for(let previousCommand of commandManager.objects) previousCommand.cancel();
            if(command == null) return;
            commandManager.addObject(command);
            console.log(command.name + " started"); //TODO remove print
        }

        const executeRelativeInputMessage = (commandManager) => {

            const getVectorFromOneParsableString = (splittedMessage, commandManager) => {

                const getAmplitudedVector = (a,b,amplitude) => {
                    const getDistanceBetweenVectors = (a,b) => {
                        const twoPointVector = new Vector(b.x-a.x, b.y-a.y);
                        const distance = Math.pow(Math.pow(twoPointVector.x,2)+Math.pow(twoPointVector.y,2),0.5);
                        return distance;
                    }
                    const getTwoPointVector = (a,b) => new Vector(b.x-a.x, b.y-a.y);
                    const getMultipliedVector = (v,factor) => new Vector(v.x*factor, v.y*factor);
                    if(a === undefined || b === undefined || amplitude === undefined) return null;
                    const distance = getDistanceBetweenVectors(a,b);
                    if(distance == 0) return null;
                    const multiplicationFactor = 1/distance;
                    const unitVector = getMultipliedVector(getTwoPointVector(a,b), multiplicationFactor);
                    return getMultipliedVector(unitVector,amplitude);
                }

                const getActiveCommand = (commandManager) => { //TODO write this in the command manager
                    if(commandManager == null) return null;
                    const activeCommand = commandManager.getLastObject();
                    if(activeCommand == null) return null;
                    return activeCommand;
                }

                const getMousePosition = (activeCommand) => {
                    if(activeCommand == null) return null;
                    return activeCommand.currentMouseInput;
                }

                const getLastInput = (activeCommand) => { //TODO write this in the command class
                    if(activeCommand == null) return null;
                    if(activeCommand.input.length <= 0) return null;
                    return activeCommand.input[activeCommand.input.length-1];
                }

                if(splittedMessage.length != 1) return null;

                const amplitude = parseFloat(splittedMessage[0]);
                if(amplitude == null) return null;
                const activeCommand = getActiveCommand(commandManager);
                const mousePosition = getMousePosition(activeCommand);
                const lastInput = getLastInput(activeCommand); //TODO test for vector
                if(mousePosition == null || lastInput == null) return null;
                const amplitudedVector = getAmplitudedVector(lastInput, mousePosition, amplitude);
                if(amplitudedVector == null) return null;
                return [amplitudedVector.x, -amplitudedVector.y];
            }

            const getVectorFromTwoParsableStrings = (splittedMessage) => {
                if(splittedMessage.length != 2) return null;
                const values = [parseFloat(splittedMessage[0]),parseFloat(splittedMessage[1])];
                if(values[0] == null || values[1] == null) return null;
                return values;
            } 

            const getVectorFromString = (message, commandManager) => {
                if(message == null) return null;
                const splittedMessage = message.split(",");
                let values = getVectorFromTwoParsableStrings(splittedMessage);
                if(values == null) values = getVectorFromOneParsableString(splittedMessage, commandManager);
                if(values == null) return null;
                const parsedVector = new Vector(values[0], values[1]);
                return new Vector(parsedVector.x, -parsedVector.y);
            }

            const relativeVector = getVectorFromString(this.message, commandManager);
            this.message = "";
            if(relativeVector == null) return;
            if(commandManager == null) return;
            const activeCommand = commandManager.getLastObject();
            if(activeCommand == null) return;
            if(activeCommand.commandStatus != CommandStatus.OPEN) return;
            if(activeCommand.input.length <= 0) return;
            const lastInput = activeCommand.input[activeCommand.input.length-1];
            const absoluteVector = new Vector(lastInput.x+relativeVector.x, lastInput.y+relativeVector.y);
            activeCommand.input.push(absoluteVector);
            
            console.log("Calculated a relative input");
        }
        
        const ims = isMessageTextString(this.message);
        if(ims) executeCommandMessage(document, commandManager); else executeRelativeInputMessage(commandManager);
        return this;
    }

    executeLastCommand = (commandManager) => {
        const previousCommand = commandManager.getLastObject();
        this.message = "";
        for(const previousCommand of commandManager.objects) previousCommand.cancel();
        if(previousCommand == null) return this;
        commandManager.addObject(previousCommand.duplicate());
        return this;
    }

    cancelLastCommand = (commandManager) => {
        const activeCommand = commandManager.getLastObject();
        if(activeCommand == null) return this;
        if(activeCommand.commandStatus != CommandStatus.OPEN) return this;
        activeCommand.cancel();
        return this;
    }
}