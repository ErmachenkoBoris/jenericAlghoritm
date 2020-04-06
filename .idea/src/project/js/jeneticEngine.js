function Gene(x, y) {
    this.cost = 9999;
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
    if (Math.random() > chance) return;

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
    //console.log('par ', this, gene);
    let child1 = this.x + prosOrcons * pivot;
    let child2 = gene.y - prosOrcons * pivot;

    //console.log(child1);
    //console.log(child2);

    return [new Gene(this.x, child2), new Gene(child1, gene.y)];
};
Gene.prototype.calcCost = function(compareTo) {
    let distance = Math.sqrt(Math.pow(Math.floor(this.x - compareTo.x),2) +Math.pow(Math.floor(this.y - compareTo.y),2));
    this.cost = Math.floor(distance);
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
};
Population.prototype.display = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // document.body.innerHTML = '';
    // document.body.innerHTML += ("<h2>Generation: " + this.generationNumber + "</h2>");
    // document.body.innerHTML += ("<ul>");
    ctx.beginPath();
    ctx.arc(canvasWidth/2, canvasHeight/2, 20, 0, 2 * Math.PI);
    ctx.stroke();
    for (let i = 0; i < this.members.length; i++) {
        ctx.beginPath();
        ctx.arc(Math.floor(this.members[i].x), Math.floor(this.members[i].y), 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
       // document.body.innerHTML += ("<li>" + this.members[i].code + " (" + this.members[i].cost + ")");
    }
   // document.body.innerHTML += ("</ul>");
};
Population.prototype.sort = function() {

    this.members = this.members.filter((value, index) =>
        index < genes
    );
    this.members.length = genes;
    let min = 0;
    let minj = 0;
    for(let i = 0; i < this.members.length; i++){
            min = canvasWidth * canvasHeight;
            minj = 0;
        for(let j = i; j<this.members.length; j++){
            if(this.members[j].cost < min)
            {
                min = this.members[j].cost ;
                minj = j;
            }
        }

        let tmpGene = new Gene(this.members[minj].x, this.members[minj].y);
        tmpGene.cost = this.members[minj].cost;

        this.members[minj] = new Gene(this.members[i].x, this.members[i].y);
        this.members[minj].cost = this.members[i].cost;

        this.members[i] = new Gene(tmpGene.x, tmpGene.y);
        this.members[i].cost = tmpGene.cost;

    }
}
Population.prototype.generation = function() {
    for (let i = 0; i < this.members.length; i++) {
        this.members[i].calcCost(this.goal);
    }

    this.sort();
    this.display();

    for(let i = 0; i < this.members.length - 3; i=i+2) {
        let children = this.members[i].mate(this.members[i + 1]);
        this.members.push(children[0]);
        this.members.push(children[1]);

        //console.log(children);
    }

    this.sort();

    for (let i = 0; i < this.members.length; i++) {
        this.members[i].mutate(0.3);
        this.members[i].calcCost(this.goal);
    }
    this.generationNumber++;
    let scope = this;
    if(this.generationNumber % 500 == 0 )console.log(' this.generationNumber: ', this.generationNumber, this.members);
    if(this.generationNumber<10000) {
        setTimeout(function () {
            scope.generation();
        }, 50);
    }
};
const canvasWidth = 800;
const canvasHeight= 700;
const genes = 200;
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', canvasHeight);
ctx.beginPath();
ctx.arc(canvasWidth/2, canvasHeight/2, 20, 0, 2 * Math.PI);
ctx.fill();
ctx.stroke();
//
let population = new Population({x: canvasWidth/2, y:canvasHeight/2, radius: 20}, genes);
population.generation();
