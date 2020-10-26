//----------------------------------
//Extension: Additional
//Website Loader: Opens online tools
//----------------------------------

// Loads external websites

const WebsiteLoader = {
    loadURL: (url, phoneResolution) => {
        if(phoneResolution){window.open(url,"_blank", "width=480,height=800");return;}
        window.open(url,"_blank");
    }
}

//Online tools

Commands.googledrive = function(document){
    return new Command(
    document, "googledrive",
    () => true,
    () => WebsiteLoader.loadURL("http://drive.google.com", true),
    () => null
    );
}

Commands.dropbox = function(document){
    return new Command(
    document, "dropbox",
    () => true,
    () => WebsiteLoader.loadURL("http://www.dropbox.com", true),
    () => null
    );
}

Commands.trello = function(document){
    return new Command(
    document, "trello",
    () => true,
    () => WebsiteLoader.loadURL("http://www.trello.com", true),
    () => null
    );
}

Commands.google = function(document){
    return new Command(
    document, "google",
    () => true,
    () => WebsiteLoader.loadURL("http://www.google.com", true),
    () => null
    );
}

//Inspirational websites

Commands.archdaily = function(document){
    return new Command(
    document, "archdaily",
    () => true,
    () => WebsiteLoader.loadURL("http://www.archdaily.com", true),
    () => null
    );
}

Commands.dezeen = function(document){
    return new Command(
    document, "dezeen",
    () => true,
    () => WebsiteLoader.loadURL("http://www.dezeen.com", true),
    () => null
    );
}

//Recreational websites

Commands.youtube = function(document){
    return new Command(
    document, "youtube",
    () => true,
    () => WebsiteLoader.loadURL("http://www.youtube.com", true),
    () => null
    );
}

Commands.spotify = function(document){
    return new Command(
    document, "spotify",
    () => true,
    () => WebsiteLoader.loadURL("http://www.spotify.com", true),
    () => null
    );
}