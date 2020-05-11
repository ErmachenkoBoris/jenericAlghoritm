import * as extrem from "../js/extrenums.js";
import * as purpose from "../js/purpose.js";
import * as jenetic from "../js/jeneticEngine.js";

const numberExtrenums = 10;

const colorGenesDepth = '#ff00fe';
const colorGenesDistance = '#3d92f2';
const colorGenesDistanceAndDepth = '#f2093b';
const canvasWidth = 600;
const canvasHeight= 500;
const genesDefault = 300;

let currentPopulation = -1;

let wFirtst = 1/2;
let wSecond = 1/2;

function purposeDepth(scope, extrenums, globalExtremums) {
    scope.cost = 0;
    extrenums.forEach(extremum => {
        let distance = Math.sqrt(Math.pow(Math.floor(scope.x - extremum.x), 2) + Math.pow(Math.floor(scope.y - extremum.y), 2));
        if (distance <= extremum.radius) {
            scope.cost = extremum.depth;
        }
    });
}

function purposeDistnace(scope, extrenums, globalExtremums) {

    let newDistance = Math.sqrt(Math.pow(Math.floor(scope.x - globalExtremums[0].x), 2) + Math.pow(Math.floor(scope.y - globalExtremums[0].y), 2));
    scope.cost = -1;

    extrenums.forEach(extremum => {
        let distance = Math.sqrt(Math.pow(Math.floor(scope.x - extremum.x), 2) + Math.pow(Math.floor(scope.y - extremum.y), 2));
        if (distance <= extremum.radius) {
            scope.cost = newDistance;
        }
    });
}

function purposeDistnaceAndDepth(scope, extrenums, globalExtremums) {

    let criterionDistanceCost = -1;
    let criterionDepthCost = -1;
    scope.cost = -1;

    let criterionDistance = Math.sqrt(Math.pow(Math.floor(scope.x - globalExtremums[0].x), 2) + Math.pow(Math.floor(scope.y - globalExtremums[0].y), 2));

    extrenums.forEach(extremum => {
        let distance = Math.sqrt(Math.pow(Math.floor(scope.x - extremum.x), 2) + Math.pow(Math.floor(scope.y - extremum.y), 2));
        if (distance <= extremum.radius) {
            criterionDistanceCost = criterionDistance;
        }
    });

    extrenums.forEach(extremum => {
        let distance = Math.sqrt(Math.pow(Math.floor(scope.x - extremum.x), 2) + Math.pow(Math.floor(scope.y - extremum.y), 2));
        if (distance <= extremum.radius) {
            criterionDepthCost = extremum.depth;
        }
    });

    scope.cost = wSecond * (criterionDistanceCost / globalExtremums[1].cost) + wFirtst * (criterionDepthCost / globalExtremums[0].cost);
}

function createPurposes() {
    let purposes = [];
    purposes.push(purpose.generatePurpose('Depth', colorGenesDepth, purposeDepth));
    purposes.push(purpose.generatePurpose('Distance', colorGenesDistance, purposeDistnace));
    purposes.push(purpose.generatePurpose('Distance and Depth', colorGenesDistanceAndDepth, purposeDistnaceAndDepth));
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
        const population = new jenetic.Population(genesNumber[index], intersetExtrenum, purpose.color, extremums, ctx, canvasWidth, canvasHeight);
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
        let genes = [];
        genes.push(parseInt(document.getElementById('populateNumberFirst').value));
        genes.push(parseInt(document.getElementById('populateNumberSecond').value));
        genes.push(parseInt(document.getElementById('populateNumberThird').value));

        let weight2 = document.getElementById('weight').value;
        let weight1 = 100 - weight2;
        let division = weight1/weight2
        wFirtst = 1/(1+division);
        wSecond = wFirtst * division;
        console.log('wFirst ', wFirtst);
        console.log('wSecond ', wSecond);
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

function init(){;
    jenetic.clearGlobalExtrem();
    currentPopulation = -1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('circleDepthAndDisctance').style.color = colorGenesDistanceAndDepth;
    document.getElementById('circleDepth').style.color = colorGenesDistance;
    document.getElementById('circleDistance').style.color = colorGenesDepth;
}

init();

