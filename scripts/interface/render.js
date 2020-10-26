//Render functions depend on P5js
//They add render functions to other elements

//Database

Vector.prototype.render = function(viewScale, settings) {
   if(viewScale === undefined) viewScale = 1;
   noStroke();
   fill(settings.fillColor);
   rectMode(CENTER);
   rect(this.x, this.y,5/viewScale,5/viewScale);
   return this;
}

Geometry.prototype.render = function() {
   return this;
}

Arc.prototype.render = function() {
   //TODO define arc function
   return this;
}

Circle.prototype.render = function(){
   ellipse(this.centerPoint.x, this.centerPoint.y, this.radius*2, this.radius*2);
   return this;
}

Line.prototype.render = function() {
   line(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
   return this;
}

PolyLine.prototype.render = function() {
   beginShape();
   for(let v of this.vertices) vertex(v.x,v.y);
   if(this.isClosed) endShape(CLOSE); else endShape();
   return this;
}

Ray.prototype.render = function() {
   //TODO define prototype
   return this;
}

Element.prototype.render = function() {
   for(let g of this.geometry) g.render();
   return this;
}

Document.prototype.render = function() {
   for(let e of this.elements) e.render();
   return this;
}

//Command

CommandBar.prototype.render = function(position, activeCommand, settings) {

   const getDimensionsFromMessage = (message) => {
      const dimensions = new Vector(100,20);
      dimensions.x = 10+(textWidth(message));
      return dimensions;
   }

   const getCommandBarMessage = (commandBarMessage, activeCommand) => {
      if(commandBarMessage.length > 0) return commandBarMessage;
      if(activeCommand == null) return null;
      if(activeCommand.commandStatus != CommandStatus.OPEN) return null;
      //if(activeCommand.message.length > 0) activeCommand.message; //TODO activate
      return null;
   }

   const renderBoundary = (position, dimensions, offset, border, settings) => {
      noStroke();
      fill(settings.fillColor);
      rectMode(CORNERS);
      rect(
         position.x+(dimensions.x+offset+(border*2)), 
         position.y-offset,
         position.x+offset, 
         position.y-(dimensions.y+offset+(border*2))
      ); 
      //TODO remove the part in the middle of the cursor
   }

   const renderMessage = (message, position, offset, border, settings) => {
         textSize(12);
         fill(settings.textColor);
         noStroke();
         text(message, position.x + offset+5+border, position.y - (offset+5+border));
   }

   const message = getCommandBarMessage(this.message, activeCommand); //TODO add active command
   if(message == null) return;
   const offset = 0; //TODO rename
   const border = 3;
   const dimensions = getDimensionsFromMessage(message);
   renderBoundary(position, dimensions, offset, border, settings);
   renderMessage(message, position, offset, border, settings);
   return this;
}

//Interface

Cursor.prototype.render = function(settings){

   const removeDefaultCursor = () => noCursor();

   const renderCursor = (settings) => {
      stroke(settings.strokeColor);
      strokeWeight(settings.strokeWeight);
      noFill();
      ellipse(this.screenPosition.x, this.screenPosition.y,10,10); //TODO make this screen position
   }
   
   removeDefaultCursor();
   renderCursor(settings);
   return this;
}

View.prototype.render = function(activeDocument, activeCommand) {

   const renderEnvironment = (settings) => {
      background(settings.backgroundColor);
      smooth(8);
   }

   const renderRegularElements = (activeDocument, viewScale, settings) => {
      noFill();
      stroke(settings.regularElementsStrokeColor);
      strokeWeight(settings.regularElementsStrokeWeight/viewScale);
      activeDocument.render();
   }

   const renderActiveHover = (view, activeDocument, viewScale, settings) => {
      for(let element of activeDocument.getElementsOnPoint(view.cursor.documentPosition,5/viewScale)) 
      {
         noFill();
         stroke(settings.hoverElementsStrokeColor);
         strokeWeight(settings.hoverElementsStrokeWeight/viewScale);
         element.render();
         for(let g of element.geometry) for(let v of g.referencePoints) v.render(viewScale, this.theme.getVectorSettings()); //TODO v.render is not a function
      }
   }

   const renderCursor = (view, activeCommand) => {
      view.commandBar.render(this.cursor.screenPosition, activeCommand, this.theme.getCommandBarSettings()); //TODO chance to screen position
      view.cursor.render(this.theme.getCursorSettings());
   }

   const renderActiveCommand = (activeCommand, viewScale, settings) => {
      if(activeCommand == null) return;
      if(activeCommand.commandStatus != CommandStatus.OPEN) return;
      if(activeCommand.render === undefined) return;
      noFill();
      stroke(settings.commandElementsStrokeColor);
      strokeWeight(settings.commandElementsStrokeWeight/viewScale);
      activeCommand.render();
   }

   const viewScale = 1/this.getViewDimensionsScale();
   const viewScaleOrigin = [this.viewDimensions[0][0], this.viewDimensions[0][1]];

   push();
   scale(viewScale);
   translate(-viewScaleOrigin[0], -viewScaleOrigin[1]);
   renderEnvironment(this.theme.getViewSettings());
   renderRegularElements(activeDocument, viewScale, this.theme.getViewSettings());
   renderActiveHover(this, activeDocument, viewScale, this.theme.getViewSettings());
   renderActiveCommand(activeCommand, viewScale, this.theme.getViewSettings());
   pop();
   renderCursor(this, activeCommand);
   return this;
}