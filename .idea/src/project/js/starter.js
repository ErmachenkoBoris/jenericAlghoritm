import * as extrem from "../js/extrenums.js";
import * as purpose from "../js/purpose.js";
import * as jenetic from "../js/jeneticEngine.js";

const numberExtrenums = 10;

const colorGenes1 = '#8a45f2';
const colorGenes2 = '#cdf223'
const canvasWidth = 600;
const canvasHeight= 500;
const genesDefault = 300;

let currentPopulation = -1;

function purpose1(scope, extrenums, globalExtrenum) {
    scope.cost = 0;
    extrenums.forEach(extremum => {
        let distance = Math.sqrt(Math.pow(Math.floor(scope.x - extremum.x), 2) + Math.pow(Math.floor(scope.y - extremum.y), 2));
        if (distance <= extremum.radius) {
            scope.cost = extremum.depth;
        }
    });
}

function purpose2(scope, extrenums, globalExtrenum) {

    let newDistance = Math.sqrt(Math.pow(Math.floor(scope.x - globalExtrenum.x), 2) + Math.pow(Math.floor(scope.y - globalExtrenum.y), 2));
    scope.cost = -1;

    extrenums.forEach(extremum => {
        let distance = Math.sqrt(Math.pow(Math.floor(scope.x - extremum.x), 2) + Math.pow(Math.floor(scope.y - extremum.y), 2));
        if (distance <= extremum.radius) {
            scope.cost = newDistance;
        }
    });
}

function createPurposes() {
    let purposes = [];
    purposes.push(purpose.generatePurpose('name1', colorGenes1, purpose1));
    purposes.push(purpose.generatePurpose('name2', colorGenes2, purpose2));

    return purposes;
}
function forParallelCases(current) {
    if(current>=populationsArray.length) {
        return;
    }
    if(!populationsArray[current].finished && !populationsArray[current].generationNumber && populationsArray[current].pause ) {
        populationsArray[current].pause = false;
        currentPopulation = current;
        populationsArray[current].generation();
    } else {
        if(populationsArray[current].finished) {
            populationsArray.forEach(population => {
                population.interestExtremum = populationsArray[current].interestExtremum;
            });
            current++;
        }
    }
    setTimeout(()=>{ forParallelCases(current);}, 0);

}
function launchProgram(genesNumber) {

    let extremums = generateExtremums(10);
    let intersetExtrenum;

    createPurposes().forEach((purpose, index) => {
        const population = new jenetic.Population((index+1)*genesNumber, intersetExtrenum, purpose.color, extremums, ctx, canvasWidth, canvasHeight);
        populationsArray.push(population);
        population.calcCost = purpose.purposeFunction;
        population.pause = true;
    });

    forParallelCases(0);
}

function generateExtremums(numExtremums) {
    let extrenums = [];
        for (let i = 0; i < numExtremums; i++) {
            extrenums.push(extrem.generateExtremum(canvasWidth, canvasHeight));
        }
        extrenums.sort((a, b) => a.depth - b.depth);
        extrenums.forEach((value, index) => value.color = extrem.lightenDarkenColor(extrem.extrenumColor, -20 * index));
        extrenums[numberExtrenums - 1].color = 'black';
        return extrenums;
}

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', canvasHeight);

let populationsArray = [];

document.getElementById('start_button').addEventListener('click', () => {
    if(populationsArray.length>0) {
        const active = populationsArray.some(population => !population.finished);
        if(active) {
            pause();
        } else {
            stop();
        }
    } else {
        if (populationsArray && populationsArray.length > 0) return;
        let genes = parseInt(document.getElementById('populateNumber').value);
        if (!genes) genes = genesDefault;

        launchProgram(genes);
    }
});
document.getElementById('pause_button').addEventListener('click', () => {
    const active = populationsArray.some(population => !population.finished);
    if(active) {
        pause();
    } else {
        stop();
    }

});

function pause() {
    if(currentPopulation >= 0) {
        const pause = populationsArray[currentPopulation].pause;
        populationsArray[currentPopulation].pause = !pause;
        if(pause) {
            populationsArray[currentPopulation].generation();
        }
    }
}

function stop() {
    populationsArray.forEach(population => {population.pause = true;
    });
    populationsArray = [];
    setTimeout(init, 0);
}

document.getElementById('stop_button').addEventListener('click', () => {
    stop();
});
document.getElementById('populateNumber').focus();

function init(){;
    jenetic.clearGlobalExtrem();
    currentPopulation = -1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

init();

