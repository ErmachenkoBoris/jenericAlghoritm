const circleRadius = 2;
const timeOneRound = 150;

let canvasWidth;
let canvasHeight;
const colorExtrenum = '#f21c14';

function Gene(x, y) {
    this.success = 0;
    this.cost = 0;
    if (x) this.x = x % canvasWidth;
    if (y) this.y = y % canvasHeight;
};
Gene.prototype.x = 0;
Gene.prototype.y = 0;
Gene.prototype.random = function() {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
};
Gene.prototype.mutate = function(chance) {
    if (Math.random() > chance || this.success == 1) return;

    let xOrY = Math.random() <= 0.5 ? -1 : 1;
    let consOrpros = Math.random() <= 0.5 ? -1 : 1;
    if(xOrY>=0) {
        let mutateRandome = Math.random() * canvasWidth;
        if(consOrpros) {
            this.x = (this.x + mutateRandome)%canvasWidth;
        } else {
            this.x = Math.abs(this.x - mutateRandome)%canvasWidth;
        }
    } else {
        let mutateRandome = Math.random() * canvasHeight;
        if(consOrpros) {
            this.y = (this.y + mutateRandome)%canvasHeight;
        } else {
            this.y= Math.abs(this.y - mutateRandome)%canvasHeight;
        }
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
export function Population(size, interestExtremum, colorGenes, extremums, canvas, cW, cH) {
    canvasWidth = cW;
    canvasHeight = cH;
    this.pause = false;
    this.size = size;
    this.ctx = canvas;
    this.executing = true;
    this.interestExtremum = interestExtremum;
    this.extremums = extremums;
    this.members = [];
    this.colorGenes = colorGenes;
    this.generationNumber = 0;
    while (size--) {
        let gene = new Gene();
        gene.random();
        this.members.push(gene);
    }
};
Population.prototype.calcCost = function(scope, extremums) {
};
Population.prototype.display = function() {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < this.extremums.length; i++) {
        this.ctx.beginPath();
        this.ctx.arc(Math.floor(this.extremums[i].x), Math.floor(this.extremums[i].y), this.extremums[i].radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.extremums[i].color;
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
    if(this.interestExtremum && this.interestExtremum.x && this.interestExtremum.y) {
        this.ctx.beginPath();
        this.ctx.arc(Math.floor(this.interestExtremum.x), Math.floor(this.interestExtremum.y), circleRadius*2, 0, 2 * Math.PI);
        this.ctx.fillStyle = colorExtrenum;
        this.ctx.fill();
        this.ctx.stroke();
    }

};

Population.prototype.sort = function() {
    let max = 0;
    let maxj = 0;
    for(let i = 0; i < this.members.length; i++){
            max = 0;
        maxj = 0;
        for(let j = i; j<this.members.length; j++){
            if(this.members[j].cost > max)
            {
                max = this.members[j].cost ;
                maxj = j;
            }
        }

        let tmpGene = new Gene(this.members[maxj].x, this.members[maxj].y);
        tmpGene.cost = this.members[maxj].cost;

        this.members[maxj] = new Gene(this.members[i].x, this.members[i].y);
        this.members[maxj].cost = this.members[i].cost;

        this.members[i] = new Gene(tmpGene.x, tmpGene.y);
        this.members[i].cost = tmpGene.cost;
    }

    let tmpArr = new Array();
    tmpArr = this.members.filter((value, index) =>
        index < this.size
    );
    this.members = tmpArr;
}
Population.prototype.executing = false;

Population.prototype.generation = function() {
    for (let i = 0; i < this.members.length; i++) {
        this.calcCost(this.members[i], this.extremums, globalExtrenum);
        // this.members[i].cost = this.calcCost(this.members[i], this.extremums, globalExtrenum);
    }

    this.sort();
    this.display();
    if(checkFinish(this.members)) {


        calculateGlobalExtrnum(this.members);
        this.interestExtremum = globalExtrenum;

        this.executing = false;
        return true;
    }

    for(let i = 0; i < this.members.length / 2; i=i+2) {
        let children = this.members[i].mate(this.members[i + 1]);
        this.members.push(children[0]);
        this.members.push(children[1]);
    }
    for (let i = this.members.length / 2; i < this.members.length; i++) {
        this.members[i].mutate(0.7);
        this.calcCost(this.members[i], this.extremums, globalExtrenum);
       // this.members[i].cost = this.calcCost(this.members[i], this.extremums, globalExtrenum);
       // this.members[i].calcCost(members[i], this.extremums, globalExtrenum);
    }
    let scope = this;
    if (!this.pause) {
            setTimeout(function () {
                scope.generation();
            }, timeOneRound);
        }
};

let globalExtrenum = {
    x: 0,
    y: 0
}
function calculateGlobalExtrnum(members) {
    let sumY = 0;
    let sumX = 0;
    let length = members.length / 2;
    for (let i = 0; i < length; i++) {
        sumX += members[i].x;
        sumY += members[i].y;

    }
    globalExtrenum.x = sumX / length;
    globalExtrenum.y = sumY / length;
}
let oldValue;
let countFinish = 0;
function checkFinish(members) {
    if(members[0].cost == oldValue) {
        countFinish++;
    };
    if(countFinish > members.length/10) {
        return true;
    }
    oldValue = members[0].cost;
    return false;
}




