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

//TODO only adds the last one, fix this

const getSnapshotContent = function(content){

    const getCommandHistoryAsFunction = function(commandManager){
        const newLine = () => "\n";

        let s = "const commandHistory = function(){" + newLine();
        //if(commandManager.length <= 0) return commandHistoryFunctionString;
        for(let i=0;i<commandManager.objects.length;i++) 
        {
            s+= "";
            const command = commandManager.objects[i];
            if(command.name === "snapshot") continue;
            const commandId = "commandCode_" + i; 
            let cs = command.getCodeString(commandId) + newLine() + "commandManager.addObject(" + commandId + ");" + newLine(); //TODO make sure that it does not only eecute the last one
            //TODO check if it contains a snapshot
            s += cs;
        }
        s += "}" + newLine() + newLine();
        const commandHistoryFunctionString = String(s);
        return commandHistoryFunctionString;
    }

    let snapshotContent = String(content);
    snapshotContent = snapshotContent.replace("loadExtensions();", "//loadExtensions();");
    snapshotContent = snapshotContent.replace("function draw()", getCommandHistoryAsFunction(commandManager) + "function draw()");
    return snapshotContent;
}

File.saveSnapshot = function(content){
    const fileName = File.getRandomFileName(); //TODO change filename to something readable
    if(fileName == null || fileName == "") return;
    saveStrings([getSnapshotContent(content)],fileName, "js"); //TODO modify the content here
}

const GetJavaScriptContent = function(){
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
    if(javaScriptReferences.isLocalSource) return File.open((content) => File.saveSnapshot(content)); //TODO fetch the data from 
}

Commands.snapshot = function(document){
    return new Command(
    document, "snapshot",
    () => true,
    () => GetJavaScriptContent(),
    () => null
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