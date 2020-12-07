const loadExtensions = () => {

    const loadJavaScriptFile = async (source) => {
        const fileref = document.createElement('script');
        fileref.type = "text/javascript";
        fileref.src = source;
        fileref.onerror = () => document.head.removeChild(fileref);
        document.head.appendChild(fileref);
    }

    for(let i=0;i<99;i++){ //TODO change back
        let s = "" + i;
        while(s.length < 2) s = "0"+s
        loadJavaScriptFile("scripts/extensions/dynamic/" + "extension-" + s + ".js"); //TODO very resource intensive
    }
}