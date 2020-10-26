let File = {
    getDocumentAsStrings: (document) => JSON.stringify(document),
    getDocumentFromString: (string) => { //TODO add try/catch
        let jsonDocument = JSON.parse(string);
        console.log(jsonDocument);
        let document = new Document();
        for(let e of jsonDocument.elements) 
        {
            let element = new Element();
            for(let g of e.geometry) 
            {
                const gT = GeometryTypes[g.geometryType];
                let geometry = new gT[0](g[gT[1]], g[gT[2]], g[gT[3]], g[gT[4]]); //TODO do this pretty
                let referencePoints = [];
                for(let v of g.referencePoints) referencePoints.push(new Vector(v.x, v.y));
                geometry.referencePoints = referencePoints;
                element.geometry.push(geometry);
            }
            document.addElement(element);
        }
        return document;
    }, //TODO add try/catch
    getRandomFileName: () => ""+year()+month()+day()+hour()+minute()+second(),
    save: (document) => {
        const fileName = File.getRandomFileName();
        //const fileName = prompt("Set the file name (.json)", File.getRandomFileName());
        if(fileName == null || fileName == "") return;
        saveStrings([File.getDocumentAsStrings(document)],fileName, "json");
    }, //TODO add taskdialog
    open: (callback) => {
        let reader = new FileReader();
        let fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.onchange = e => { 
            let file = e.target.files[0]; 
            reader.readAsText(file,'UTF-8');
            reader.onload = readerEvent => 
            {
                let content = readerEvent.target.result;
                callback(content); //TODO callback function that uses the content
            }
        }
        fileSelector.click();
    },
}