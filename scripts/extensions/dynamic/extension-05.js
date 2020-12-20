//----------------------------------
//Extension: Additional
//Snapshot: Adds a download function 
//----------------------------------

//Get the current url >> done
//Fetch the html as string array
//Parse the html for javascript elements 
//Save the complete website of the url to a file or variable
//Combines all the javascript objects used
//Modifies the javascript object
//  Add the commands that have been drawn
//  Add a frame
//Saves the modified javascript object to the desktop

const getSnapshotContent = function(content, origin, width, height){
    const newLine = () => "\n";

    const getCommandHistoryAsFunction = function(commandManager, origin, width, height){

        let s = "const commandHistory = function(){" + newLine();
        //if(commandManager.length <= 0) return commandHistoryFunctionString;
        for(let i=0;i<commandManager.objects.length;i++) 
        {
            s+= "";
            const command = commandManager.objects[i];
            if(command.name === "snapshot") continue;
            const commandId = "commandCode_" + i; 
            let cs = command.getCodeString(commandId, origin) + newLine() + commandId + ".execute();" + newLine();
            s += cs;
        }
        s += "}" + newLine() + newLine();
        const commandHistoryFunctionString = String(s);
        return commandHistoryFunctionString;
    }

    let snapshotContent = String(content);
    snapshotContent = snapshotContent.replace("loadExtensions();", "//loadExtensions();");
    snapshotContent = snapshotContent.replace("function draw()", getCommandHistoryAsFunction(commandManager, origin) + "function draw()");
    snapshotContent = snapshotContent.replace("function draw() {", "function draw() {" + newLine() + "if(frameCount == 10) commandHistory();");
    
    //TODO do something width the width an height

    return snapshotContent;
}

File.saveSnapshot = function(content, origin, width, height){
    const fileName = File.getRandomFileName(); //TODO change filename to something readable
    if(fileName == null || fileName == "") return;
    saveStrings([getSnapshotContent(content, origin, width, height)],fileName, "js"); //TODO modify the content here
}

const GetJavaScriptContent = function(origin, width, height){
    const GetJavaScriptReferences = function(){

        const isUrlsHttpSource = (urls) => {
            for(const url of urls) if(url.startsWith("http")) return true;
            return false;
        }

        const isUrlsLocalSource = (urls) => {
            for(const url of urls) if(url.startsWith("file://")) return true;
            return false;
        }

        let urls = [];
        for(const element of document.getElementsByTagName("script")) if(element.src.endsWith(".js")) urls.push(element.src);

        //window.location.href = url;

        //let response = await fetch('scripts/manager/manager.js');
        //console.log(response.text()); //only works on http
        //TODO request the documents over url on the same domain
        //TODO add the strings together
        //TODO save the string as a javascript object
        
        return {
            isHttpSource: isUrlsHttpSource(urls),
            isLocalSource: isUrlsLocalSource(urls),
            srcArray: urls
        }
    }

    const javaScriptReferences = GetJavaScriptReferences();
    if(javaScriptReferences.srcArray.length <= 0) return null;
    if(javaScriptReferences.isHttpSource) console.log("A http fetch request"); //TODO write the fetch request
    if(javaScriptReferences.isLocalSource) return File.open((content) => File.saveSnapshot(content, origin, width, height)); //TODO fetch the data from 
}

Commands.snapshot = function(document){
    return new Command(
    document, "snapshot",
    function(){
        if(this.input.length < 2) return false;
        return true;
    },
    function(){
        minX = this.input[0].x;
        if(this.input[1].x < this.input[0].x) minX = this.input[1].x;
        minY = this.input[0].y;
        if(this.input[1].y < this.input[0].y) minY = this.input[1].y;
        maxX = this.input[1].x;
        if(this.input[1].x < this.input[0].x) maxX = this.input[0].x;
        maxY = this.input[1].y;
        if(this.input[1].y < this.input[0].y) minX = this.input[0].x;
        origin = new Vector(minX, minY);
        width = maxX-minX;
        height = maxY-minY;
        GetJavaScriptContent(origin, width, height); //TODO snaps everything to the origin, fix this
    },
    function(){
        const getCornerVectors = (a,b) => [new Vector(a.x,a.y), new Vector(a.x, b.y), new Vector(b.x, b.y), new Vector(b.x, a.y)]; //TODO error here
        if(this.input.length == 0) return;
        if(this.input[0] == null) return;
        if(this.currentMouseInput == null) return;
        const l = new PolyLine(getCornerVectors(this.input[0], this.currentMouseInput), true);
        l.render();
    }
    );
}

//https://stackoverflow.com/questions/4862955/can-javascript-access-source-code-of-a-script-src-element/4862987#4862987
//https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
//https://stackoverflow.com/questions/39758031/get-text-from-a-txt-file-in-the-url
//https://50linesofco.de/post/2019-07-05-reading-local-files-with-javascript

//https://github.com/john-doherty/offline-fetch

//Ways to solve
//- Create a Node.js for automatically combining the .js files into a single .txt file (local), if online, do it dynamically
//- Let the user open a preset .txt file (preset options) that will be parsed to a .js file