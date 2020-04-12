import * as extrem from './extrenums.js';

const circleRadius = 2;
const timeOneRound = 300;
const numberExtrenums = 10;
const colorGenes = '#F25387'
const canvasWidth = 600;
const canvasHeight= 500;
const genesDefault = 200;

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
Gene.prototype.calcCost = function(compareTo) {
    extrenums.forEach(extremum => {
        this.cost = 0;
        let distance = Math.sqrt(Math.pow(Math.floor(this.x - extremum.x),2) +Math.pow(Math.floor(this.y - extremum.y),2))
        if(distance<=extremum.radius) {
            this.cost = extremum.depth;
        }
    });
};
function Population(goal, size) {
    this.members = [];
    this.goal = goal;
    this.generationNumber = 0;
    while (size--) {
        let gene = new Gene();
        gene.random();
        this.members.push(gene);
    }
    for(let i = 0; i< numberExtrenums; i ++) {
        extrenums.push(extrem.generateaddNewExtremum(canvasWidth, canvasHeight));
        console.log(extrenums);
    }
    extrenums.sort((a, b) => a.depth - b.depth);
    extrenums.forEach((value, index)=> value.color = extrem.lightenDarkenColor(extrem.extrenumColor, -20*index));
    extrenums[numberExtrenums-1].color = 'black';
};
Population.prototype.display = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < extrenums.length; i++) {
        ctx.beginPath();
        ctx.arc(Math.floor(extrenums[i].x), Math.floor(extrenums[i].y), extrenums[i].radius, 0, 2 * Math.PI);
        ctx.fillStyle = extrenums[i].color;
        ctx.fill();
        ctx.stroke();
    }
    for (let i = 0; i < this.members.length; i++) {
        ctx.beginPath();
        ctx.arc(Math.floor(this.members[i].x), Math.floor(this.members[i].y), circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = colorGenes;
        ctx.fill();
        ctx.stroke();
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

    this.members = this.members.filter((value, index) =>
        index < genes
    );
    this.members.length = genes;
}
Population.prototype.generation = function() {
    for (let i = 0; i < this.members.length; i++) {
        this.members[i].calcCost(this.goal);
    }

    this.sort();
    this.display();

    for(let i = 0; i < this.members.length / 2; i=i+2) {
        let children = this.members[i].mate(this.members[i + 1]);
        this.members.push(children[0]);
        this.members.push(children[1]);
    }
    for (let i = 0; i < this.members.length; i++) {
        this.members[i].mutate(0.3);
        this.members[i].calcCost();
    }
    this.generationNumber++;
    let scope = this;
    if(!pause) {
        setTimeout(function () {
            scope.generation();
        }, timeOneRound);
    }
};

let genes;
let pause = false;
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', canvasHeight);

let population;
document.getElementById('start_button').addEventListener('click', () => {
    if(population) return;
    pause = false;
    genes = parseInt(document.getElementById('populateNumber').value);
    if(!genes) genes = genesDefault;
    population = new Population({x: canvasWidth/2, y:canvasHeight/2, radius: 20}, genes);
    population.generation();
});
document.getElementById('pause_button').addEventListener('click', () => {
    if(!pause) { pause = true; } else {
        pause = false;
        population.generation();
    }
});
document.getElementById('stop_button').addEventListener('click', () => {
    pause = true;
    setTimeout(init, 0);

});
document.getElementById('populateNumber').focus();

function init(){
    population = undefined;
    extrenums = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let extrenums = [];




