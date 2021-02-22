const getGeometryFromImportedData = (data) =>{
    if(data === undefined) return undefined;
    const parsedData = JSON.parse(data);
    if(parsedData === undefined) return undefined;
    if(parsedData.entities === undefined) return undefined;

    let geometry = [];
    for(let i=0; i<parsedData.entities.length; i++){
        const entity = parsedData.entities[i];
        if(entity === undefined) continue;
        if(entity.type === "Line"){
            geometry.push(
                Elements.line(
                    new Vector(entity.vertices[0].x, entity.vertices[0].y),
                    new Vector(entity.vertices[1].x, entity.vertices[1].y)
                )
            );
            continue;
        } 
        //TODO add support for polylines and arcs
    }
    return geometry;
}

class ImportElement extends Element{

    //Constuctor
    constructor(geometry){
        super(geometry);
    }

    //Non-chainable methods

    collision = () => null;

    getReferencePointOnPoint(point, tolerance){
        return null;
    }

    //Chainable methods
    rebuild = (cursorDocumentPosition) => {
        //console.log("Rebuilding custom element");
        return this;
    }

    /*render = () => {
        background("#feda00");
    }*/

}

Commands.import = function(document){
    return new Command(
    document, "import",
    () => true,
    () => File.open((data) => document.addElement(new ImportElement(getGeometryFromImportedData(data)))),
    () => null
    );
}