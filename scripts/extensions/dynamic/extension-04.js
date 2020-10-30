//----------------------------------
//Extension: Additional
//Path: Adds a path with automatic pathfinding
//----------------------------------

//TODO nest them into the element

//TODO finish writing the class from the python example

/*class IntegerVector {

    //Constructor

    constructor(x,y){
        this.x = x;
        this.y = y;
        if(x === undefined) this.x = 0;
        if(y === undefined) this.y = 0;
    }

    //Non-Chainable Methods

    getValuesAsArray = () => [this.x, this.y];
}

class AStarCell {

    //Constructor

    constructor(index, parentIndex, startIndex, endIndex){
        this.index = index;
        this.parentIndex = parentIndex;
        this.g = this.getIndexDistance(this.index, startIndex);
        this.h = this.getIndexDistance(this.index, endIndex);
        this.f = this.g + this.h;
    }

    //Non-Chainable Methods

    getIndexDistance = (index, targetIndex) => Math.abs(index.x-targetIndex.x) + Math.abs(index.y-targetIndex.y);

    isInCellList = (cellList) => {
        for(cell of cellList) if(this.index.x == cell.index.x && this.index.y == cell.index.y) return true;
        return false;
    }

    getParentCell = (cellList) => {
        for(cell of cellList) if(this.parentIndex.x == cell.index.x && this.parentIndex.y == cell.index.y) return cell;
        return null;
    }

    getAdjacentCells = (cells, startIndex, endIndex) => {
        let adjacentCells = [];
        for(let i=-1;i<2;i++){
            for(let j=-1;j<2;j++){
                if((i*j) != 0) continue;
                const ADJACENT_INDEX = new IntegerVector(this.index.x+i, this.index.y+j);
                if(ADJACENT_INDEX.x < 0 || ADJACENT_INDEX.y < 0) continue;
                if(ADJACENT_INDEX.x >= cells.length || ADJACENT_INDEX.y >= cells[0].length) continue;
                if(cells[ADJACENT_INDEX.x][ADJACENT_INDEX.y] === undefined) continue;
                adjacentCells.push(new AStarCell(ADJACENT_INDEX, this.index, startIndex, endIndex));
            }
        }
    }

    //TODO getClosedCells

    //TODO getAStarIndices

}*/