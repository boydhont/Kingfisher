class Theme {

    //Constructor

    constructor() {
        this.currentSettings = DIGITAL_RENAISSANCE_THEME_SETTINGS;
        this.setDefaultSettings().setCurrentSettings();
    }

    //Non-chainable methods

    getThemeName = () => this.themeName;

    getVectorSettings = () => { 
        return {
            fillColor: this.vectorFillColor
        };
    };

    getCommandBarSettings = () => { 
        return {
            fillColor: this.commandBarFillColor,
            textColor: this.commandBarTextColor
        };
    };

    getCursorSettings = () => {
        return {
            strokeColor: this.cursorStrokeColor,
            strokeWeight: this.cursorStrokeWeight
        };
    };

    getViewSettings = () => {
        return {
            backgroundColor: this.viewBackgroundColor,
            regularElementsStrokeColor: this.viewRegularElementsStrokeColor,
            regularElementsStrokeWeight: this.viewRegularElementsStrokeWeight,
            hoverElementsStrokeColor: this.viewHoverElementsStrokeColor,
            hoverElementsStrokeWeight: this.viewHoverElementsStrokeWeight,
            commandElementsStrokeColor: this.viewCommandElementsStrokeColor,
            commandElementsStrokeWeight: this.viewCommandElementsStrokeWeight
        };
    };

    //Chainable methods

    setDefaultSettings = () => {
        this.themeName = "Default Theme";
        this.vectorFillColor = "#ffffff";
        this.commandBarFillColor = "#282828";
        this.commandBarTextColor = "#ffffff";
        this.cursorStrokeColor = "#ffffff";
        this.cursorStrokeWeight = 2;
        this.viewBackgroundColor = "#000000";
        this.viewRegularElementsStrokeColor = "#ffffff";
        this.viewRegularElementsStrokeWeight = 2;
        this.viewHoverElementsStrokeColor = "#505050";
        this.viewHoverElementsStrokeWeight = 2;
        this.viewCommandElementsStrokeColor = "#ffffff";
        this.viewCommandElementsStrokeWeight = 2;
        return this;
    }

    setCurrentSettings = () => {
        const content = JSON.parse(this.currentSettings)[0];
        this.themeName = content.themeName;
        this.vectorFillColor = content.vectorFillColor;
        this.commandBarFillColor = content.commandBarFillColor;
        this.commandBarTextColor = content.commandBarTextColor;
        this.cursorStrokeColor = content.cursorStrokeColor;
        this.cursorStrokeWeight = content.cursorStrokeWeight;
        this.viewBackgroundColor = content.viewBackgroundColor;
        this.viewRegularElementsStrokeColor = content.viewRegularElementsStrokeColor;
        this.viewRegularElementsStrokeWeight = content.viewRegularElementsStrokeWeight;
        this.viewHoverElementsStrokeColor = content.viewHoverElementsStrokeColor;
        this.viewHoverElementsStrokeWeight = content.viewHoverElementsStrokeWeight;
        this.viewCommandElementsStrokeColor = content.viewCommandElementsStrokeColor;
        this.viewCommandElementsStrokeWeight = content.viewCommandElementsStrokeWeight;
        return this;
    }
}