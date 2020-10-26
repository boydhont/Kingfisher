Commands.savedxf = (document) => new Command(
  document, "save",
  () => true,
  () => saveDxf(document),
  () => null
);

const saveDxf = (document) => {
  const fileName = File.getRandomFileName();
  //const fileName = prompt("Set the file name (.dxf)", File.getRandomFileName());
  if(fileName == null || fileName == "") return;
  saveStrings(getDxfStringsFromDocument(document),fileName, "dxf");
};

const getDxfStringsFromDocument = (document) => {

  const getDxfElementStrings = (element) => {
    
    const getDxfGeometryStrings = (geometry) => {
     
      const getDxfLineStrings = (a,b) => {
        return [
          "0",
          "LINE",
          "8",
          "0", //Current layer
          "10",
          a.x.toString(), //a.x
          "20",
          (-a.y).toString(), //a.y
          //"30",
          //"0", //a.z
          "11",
          b.x.toString(), //b.x
          "21",
          (-b.y).toString(), //b.y
          //"31",
          //"0" //b.z
        ];
      }

      const getDxfCircleStrings = (c,r) => {
        return [
          "0",
          "CIRCLE",
          "8",
          "0", //Current layer
          "10",
          c.x.toString(), //centerpoint x
          "20",
          (-c.y).toString(), //centerpoint y
          //"30",
          //"0", //centerpoint.z
          "40",
          r.toString() //radius
        ];
      }

      const getDxfPolylineStrings = (v,c) => {
        let dxfString = [
          "0",
          "LWPOLYLINE",
          "8",
          "0",  //Current layer
          "90",
          v.length.toString(), //Amount of vertices
          "70"
        ];

        if(c) dxfString.push("1"); else dxfString.push("0"); //Open/closed polyline 
        for(const vertex of v) dxfString = dxfString.concat(["10",vertex.x.toString(),"20",(-vertex.y).toString()]); //Vertex positions

        return dxfString;
      }

      if(geometry instanceof Line) return getDxfLineStrings(geometry.startPoint, geometry.endPoint);
      if(geometry instanceof Circle) return getDxfCircleStrings(geometry.centerPoint, geometry.radius);
      if(geometry instanceof PolyLine) return getDxfPolylineStrings(geometry.vertices, geometry.isClosed);
      return [];
    }

    let stringArrayBuilder = [];
    for(const geometry of element.geometry) stringArrayBuilder = stringArrayBuilder.concat(getDxfGeometryStrings(geometry));
    return stringArrayBuilder;
  }

  const getDxfHeaderStrings = () => {
    return [
      "0",
      "SECTION",
      "2",
      "ENTITIES"
    ];
  }

  const getDxfFooterStrings = () => {
    return [
      "0",
      "ENDSEC",
      "0",
      "EOF"
    ];
  }

  let stringArrayBuilder = [];
  stringArrayBuilder = stringArrayBuilder.concat(getDxfHeaderStrings());
  for(const element of document.elements) stringArrayBuilder = stringArrayBuilder.concat(getDxfElementStrings(element));
  stringArrayBuilder = stringArrayBuilder.concat(getDxfFooterStrings());
  const dxfStringArray = stringArrayBuilder;
  return dxfStringArray;
}