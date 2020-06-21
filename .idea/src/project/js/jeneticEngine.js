const circleRadius = 2;
const timeOneRound = 150;

let viewMode = 'map';

let canvasWidth;
let canvasHeight;
const colorExtrenum = '#f21c14';
const blackColor = '#000000';
const scaleDistance = 0.5;
const scaleDepth = 200;
const widthOffset = 100;
let heightOffset;
export let globalExtremums = new Array();

export function setVewMode(mode) {
    viewMode = mode;
}

function Gene(x, y, cost, extremumDistance, extremumDepth) {
    this.success = 0;
    this.cost = cost;
    this.extremumDistance = extremumDistance;
    this.extremumDepth = extremumDepth;
    if (x) this.x = x % canvasWidth;
    if (y) this.y = y % canvasHeight;
};
Gene.prototype.x = 0;
Gene.prototype.y = 0;
Gene.prototype.extremumDistance = 0;
Gene.prototype.extremumDepth = 0;
Gene.prototype.random = function() {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
};
Gene.prototype.mutate = function(chance) {
    if (Math.random() > chance || this.success == 1) return;

    let consOrpros = Math.random() <= 0.5 ? false : true;
    let mutateRandomeX = Math.random() * canvasWidth;
    let mutateRandomeY = Math.random() * canvasHeight;

        if(consOrpros) {
            this.x = (this.x + mutateRandomeX)%canvasWidth;
            this.y = (this.y + mutateRandomeY)%canvasHeight;
        } else {
            this.x = Math.abs(this.x - mutateRandomeX)%canvasWidth;
            this.y= Math.abs(this.y - mutateRandomeY)%canvasHeight;
        }
};

Gene.prototype.mate = function(gene) {
    let pivot = Math.random() * 20;
    let prosOrcons = Math.random() <= 0.5 ? -1 : 1;
    let child1 = this.x + prosOrcons * pivot;
    let child2 = gene.y - prosOrcons * pivot;
    return [new Gene(this.x, child2), new Gene(child1, gene.y)];
};
Gene.prototype.calcCost = function(scope, extremums) {
};
export function Population(size, colorGenes, extremums, canvas, cW, cH, name) {
    this.name = name;
    canvasWidth = cW;
    canvasHeight = cH;
    this.pause = false;
    this.size = size;
    this.ctx = canvas;
    this.finished = false;
    this.extremums = extremums;
    this.members = [];
    this.colorGenes = colorGenes;
    this.generationNumber = 0;
    while (size--) {
        let gene = new Gene();
        gene.random();
        this.members.push(gene);
    }
    this.oldValue;
    this.countFinish = 0;
    heightOffset = canvasHeight - 100;
};
Population.prototype.calcCost = function(scope, extremums) {
};

let clearFlag = true;

Population.prototype.display = function() {
    if(this.pause) {
        return;
    }

    let extremumsTmp = this.extremums.slice();
    extremumsTmp.sort((a, b) => a.depth - b.depth);
    if(viewMode != 'map' && this.name == 'Distance and Depth') {
        if(clearFlag) {
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            clearFlag = false;
        }
        drawField(this.ctx);
        for (let i = 0; i < this.members.length; i++) {
            this.ctx.beginPath();
            this.ctx.arc(
                widthOffset+ Math.floor(scaleDistance*this.members[i].extremumDistance*globalExtremums[1].cost),
                heightOffset - Math.floor(scaleDepth*this.members[i].extremumDepth*globalExtremums[0].cost),
                circleRadius + 4*this.members[i].cost,
                0,
                2 * Math.PI);
            this.ctx.fillStyle = this.colorGenes;
            this.ctx.fill();
            this.ctx.stroke();
        }
        this.drawResults(false, viewMode);
    } else {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < extremumsTmp.length; i++) {
            this.ctx.beginPath();
            this.ctx.arc(Math.floor(extremumsTmp[i].x), Math.floor(extremumsTmp[i].y), extremumsTmp[i].radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = extremumsTmp[i].color;
            this.ctx.fill();
            this.ctx.stroke();
        }

        for (let i = 0; i < this.members.length; i++) {
            this.ctx.beginPath();
            this.ctx.arc(Math.floor(this.members[i].x), Math.floor(this.members[i].y), circleRadius, 0, 2 * Math.PI);
            this.ctx.fillStyle = this.colorGenes;
            this.ctx.fill();
            this.ctx.stroke();
        }
       this.drawResults(false, viewMode);
    }


};

Population.prototype.sort = function() {
    let max = 0;
    let maxj = 0;
    for(let i = 0; i < this.members.length; i++){
            max = -100;
        maxj = 0;
        for(let j = i; j<this.members.length; j++){
            if(this.members[j].cost > max)
            {
                max = this.members[j].cost ;
                maxj = j;
            }
        }

        let tmpGene = new Gene(
            this.members[maxj].x,
            this.members[maxj].y,
            this.members[maxj].cost,
            this.members[maxj].extremumDistance,
            this.members[maxj].extremumDepth);

        this.members[maxj] = new Gene(
            this.members[i].x,
            this.members[i].y,
            this.members[i].cost,
            this.members[i].extremumDistance,
            this.members[i].extremumDepth);
        this.members[i] = new Gene(
            tmpGene.x,
            tmpGene.y,
            tmpGene.cost,
            tmpGene.extremumDistance,
            tmpGene.extremumDepth);
    }
    let tmpArr = new Array();
    tmpArr = this.members.filter((value, index) =>
        index < this.size
    );
    this.members = new Array();
    this.members = tmpArr;
}
Population.prototype.executing = false;

Population.prototype.drawResults = function(clean, viewModeLocal) {
    if(this.pause) {
        return;
    }
    if(viewMode == 'map' || viewMode != 'map' && this.name != 'Distance and Depth') {
        if(clean) {
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            const extremumsTmp = this.extremums.slice();
            extremumsTmp.sort((a, b) => a.depth - b.depth);
            for (let i = 0; i < extremumsTmp.length; i++) {
                this.ctx.beginPath();
                this.ctx.arc(Math.floor(extremumsTmp[i].x), Math.floor(extremumsTmp[i].y), extremumsTmp[i].radius, 0, 2 * Math.PI);
                this.ctx.fillStyle = extremumsTmp[i].color;
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
        for (let i = 0; i < globalExtremums.length; i++) {
            this.ctx.beginPath();
            this.ctx.arc(Math.floor(globalExtremums[i].x), Math.floor(globalExtremums[i].y), circleRadius*2, 0, 2 * Math.PI);
            this.ctx.fillStyle = globalExtremums[i].color;
            this.ctx.fill();
            this.ctx.stroke();
        }
    } else {
        drawField(this.ctx);
        const l = globalExtremums.length;
        this.ctx.beginPath();
        this.ctx.arc(
            widthOffset + Math.floor(scaleDistance * globalExtremums[l-1].extremumDistance * globalExtremums[1].cost),
            heightOffset - Math.floor(scaleDepth * globalExtremums[l-1].extremumDepth * globalExtremums[0].cost),
            circleRadius + 4*globalExtremums[l-1].cost,
            0,
            2 * Math.PI);
        this.ctx.fillStyle = blackColor;
        this.ctx.fill();
        this.ctx.stroke();
    }
}

Population.prototype.generation = function() {
    this.generationNumber++;
    for (let i = 0; i < this.members.length; i++) {
        if(this.members[i].cost<=0) {
            this.calcCost(this.members[i], this.extremums, globalExtremums);
        }
    }

    this.sort();
    this.display();
    if(checkFinish(this.members, this)) {
        calculateGlobalExtrnum(this.members, this.colorGenes, this.extremums);
        globalExtremums.push({...globalExtrenum});
        this.drawResults(true, viewMode);
        this.finished = true;
        clearFlag = true;
        return true;
    }

    for(let i = 0; i < this.members.length / 2; i=i+2) {
        let children = this.members[i].mate(this.members[i + 1]);
        this.members.push(children[0]);
        this.members.push(children[1]);
    }

    for (let i = 0; i < this.members.length; i++) {
        this.calcCost(this.members[i], this.extremums, globalExtremums);
    }

    this.sort();

    for (let i = this.members.length / 2; i < this.members.length; i++) {
        this.members[i].mutate(0.7);
        this.calcCost(this.members[i], this.extremums, globalExtremums);
    }
    let scope = this;
    if (!this.pause) {
        setTimeout(function () { scope.generation(); }, timeOneRound);
    }
};

let globalExtrenum = {
    color: undefined,
    cost: -1,
    x: 0,
    y: 0,
    depth: 0,
    distance: 0,
}
export function clearGlobalExtrem() {
    globalExtremums = [];
    globalExtremums = new Array();

    globalExtrenum = {
        x: 0,
        y: 0,
        cost: 0,
        color: undefined,
        depth: 0,
        distance: 0,
        extremumDistance: 0,
        extremumDepth: 0
    };
}
function calculateGlobalExtrnum(members, color, extremums) {
    let sumY = 0;
    let sumX = 0;
    let length = members.length / 2;
    let cost = -1;
    let count = 0;
    for (let i = 0; i < length; i++) {
        if(members[i].cost >=cost) {
            cost = members[i].cost;
            globalExtrenum.extremumDistance = members[i].extremumDistance;
            globalExtrenum.extremumDepth = members[i].extremumDepth;
            sumX += members[i].x;
            sumY += members[i].y;
        };
        if(members[i].cost < cost) {
            length = i;
            break;
        }
    }
    globalExtrenum.x = sumX / length;
    globalExtrenum.y = sumY / length;
    globalExtrenum.cost = cost;
    globalExtrenum.color = color;

    if(globalExtremums[0]) {
        const x = globalExtremums[0].x;
        const y = globalExtremums[0].y;
        globalExtrenum.distance = Math.sqrt(Math.pow(Math.floor(x - globalExtrenum.x), 2) + Math.pow(Math.floor(y - globalExtrenum.y), 2));
    }
    globalExtrenum.depth = 0;
    extremums.forEach(extremum => {
        let distance = Math.sqrt(Math.pow(Math.floor( globalExtrenum.x  - extremum.x), 2) + Math.pow(Math.floor(globalExtrenum.y - extremum.y), 2));
        if (distance <= extremum.radius && globalExtrenum.depth<=extremum.depth) {
            globalExtrenum.depth  = extremum.depth;
        }
    });
}

function checkFinish(members, scope) {
    if(members && members.length && members[0].cost == scope.oldValue) {
        scope.countFinish++;
    };
    if(scope.countFinish > members.length/10) {
        return true;
    }
    if(members && members.length) {
        scope.oldValue = members[0].cost;
    }
    return false;
}

function drawField (ctx) {
    const edge = 250;
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'silver';
    for (let i = 0; i < canvasWidth; i += 50) {
        for (let j = 0; j < canvasHeight; j += 50) {
            ctx.strokeRect(i, j, 50, 50);
        }
    }

    for (let i = 0; i < canvasWidth; i += 50) {
        if(i!=400) {
            if(i==0){
                ctx.fillText(0, widthOffset, heightOffset);
            } else {
                ctx.fillText((i/scaleDistance).toFixed(1), widthOffset + i, heightOffset);
                ctx.fillText((i/scaleDepth).toFixed(2), widthOffset, heightOffset - i);
            }

        } else {
            ctx.fillText('DISTANCE', widthOffset + i, heightOffset);
            ctx.fillText('DEPTH', widthOffset, heightOffset - i);
            return;
        }
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(widthOffset, 0);
    ctx.lineTo(widthOffset, canvasHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, heightOffset);
    ctx.lineTo(canvasWidth, heightOffset);
    ctx.stroke();
}

