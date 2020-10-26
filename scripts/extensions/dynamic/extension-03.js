//----------------------------------
//Extension: Additional
//Arrow: Adds moving arrows
//----------------------------------

Commands.arrow = function(document) { 
    return new Command(
        document, "arrow",
        () => true,
        () => console.log("arrow"),
        () => null
    );
}