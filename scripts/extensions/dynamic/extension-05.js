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
    if(javaScriptReferences.isLocalSource) File.open((content) => console.log(content)); //TODO fetch the data from 
    return null;
}

Commands.snapshot = function(document){
    return new Command(
    document, "snapshot",
    () => true,
    () => console.log(GetJavaScriptContent()),
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