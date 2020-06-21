import * as extrem from "../js/extremums.js";
import * as purpose from "../js/purpose.js";
import * as jenetic from "../js/jeneticEngine.js";

let numberExtrenums = 10;

const colorGenesDepth = '#ff00fe';
const colorGenesDistance = '#3d92f2';
const colorGenesDistanceAndDepth = '#f2093b';
const canvasWidth = 600;
const canvasHeight= 600;
const genesDefault = 300;

let currentPopulation = -1;

let wFirtst = 1/2;
let wSecond = 1/2;
let extremums = [];
let globalExtremums = [];

function purposeDepth(scope, extrenums, globalExtremums) {
    scope.cost = 0;
    extrenums.forEach(extremum => {
        let distance = Math.sqrt(Math.pow(Math.floor(scope.x - extremum.x), 2) + Math.pow(Math.floor(scope.y - extremum.y), 2));
        if (distance <= extremum.radius &&  scope.cost <= extremum.depth) {
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

    let criterionDistanceCost = 0;
    let criterionDepthCost = 0;
    scope.cost = 0;

    let criterionDistance = Math.sqrt(Math.pow(Math.floor(scope.x - globalExtremums[0].x), 2) + Math.pow(Math.floor(scope.y - globalExtremums[0].y), 2));

    extrenums.forEach(extremum => {
        let distance = Math.sqrt(Math.pow(Math.floor(scope.x - extremum.x), 2) + Math.pow(Math.floor(scope.y - extremum.y), 2));
        if (distance <= extremum.radius) {
            criterionDistanceCost = criterionDistance;
        }
    });

    extrenums.forEach(extremum => {
        let distance = Math.sqrt(Math.pow(Math.floor(scope.x - extremum.x), 2) + Math.pow(Math.floor(scope.y - extremum.y), 2));
        if (distance <= extremum.radius && criterionDepthCost <= extremum.depth) {
            criterionDepthCost = extremum.depth;
        }
    });
    scope.extremumDistance = criterionDistanceCost / globalExtremums[1].cost;
    scope.extremumDepth = criterionDepthCost / globalExtremums[0].cost;
    scope.cost = wSecond * (criterionDistanceCost / globalExtremums[1].cost) + wFirtst * (criterionDepthCost / globalExtremums[0].cost);
}

function createPurposes(newRules) {
    let purposes = [];
    if(newRules) {
        purposes.push(purpose.generatePurpose('Depth', colorGenesDepth, purposeDepth));
        purposes.push(purpose.generatePurpose('Distance', colorGenesDistance, purposeDistnace));
    }
    purposes.push(purpose.generatePurpose('Distance and Depth', colorGenesDistanceAndDepth, purposeDistnaceAndDepth));
    return purposes;
}
function forParallelCases(current) {
    if(current>=populationsArray.length) {
        showInfo(populationsArray[current-1].name, jenetic.globalExtremums, true);
        return;
    }
    if(!populationsArray[current].finished && !populationsArray[current].generationNumber && populationsArray[current].pause ) {
        populationsArray[current].pause = false;
        currentPopulation = current;
        populationsArray[current].generation();
    } else {
        if(populationsArray[current].finished) {
            showInfo(populationsArray[current].name, jenetic.globalExtremums);
            current++;
        }
    }
    setTimeout(()=>{ forParallelCases(current);}, 0);

}
function launchProgram(genesNumber, refreshExtremums) {
    let firstAttempt = false;
    if(extremums.length === 0) {
        firstAttempt = true;
    }

    if(refreshExtremums || firstAttempt) {
        extremums = generateExtremums(numberExtrenums);
    }

    createPurposes(refreshExtremums || firstAttempt).forEach((purpose, index) => {
        const population = new jenetic.Population(genesNumber[index], purpose.color, extremums, ctx, canvasWidth, canvasHeight, purpose.name);
        populationsArray.push(population);
        population.calcCost = purpose.purposeFunction;
        population.pause = true;
    });

    forParallelCases(0);
    firstAttempt = false;
}

function generateExtremums(numExtremums) {
    let extrenums = [];
    for (let i = 0; i < numExtremums; i++) {
        extrenums.push(extrem.generateExtremum(canvasWidth, canvasHeight));
    }
    let maxDepth = -1;
    let depthIndex = -1;
    extrenums.forEach((extremum, index) => {
        if(extremum.depth > maxDepth) {
            maxDepth = extremum.depth;
            depthIndex = index;
        }
    });
    extrenums[depthIndex].color = 'black';
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
        const oldNumberExtrenums = numberExtrenums;
        numberExtrenums = parseInt(document.getElementById('extremumNumber').value);

        const refreshExtremums = document.getElementById('refreshExtremums').checked;
        const wholeUnit = +document.getElementById('adjust_first').value + +document.getElementById('adjust_second').value;

        let weight2 = document.getElementById('adjust_first').value/wholeUnit;
        let weight1 = document.getElementById('adjust_second').value/wholeUnit;

        wFirtst = weight1;
        wSecond = weight2;

        console.log('wFirst ', wFirtst);
        console.log('wSecond ', wSecond);
        if(refreshExtremums || oldNumberExtrenums!==numberExtrenums) {
            init();
        }
        launchProgram(genes, refreshExtremums || oldNumberExtrenums!==numberExtrenums);
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

let checkboxViewMode = document.getElementById('viewMode')

checkboxViewMode.addEventListener('change', () => {
    if(!checkboxViewMode.checked) {
        jenetic.setVewMode('dekart');
    } else {
        jenetic.setVewMode('map');
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
}
const iconPopulationTemplates = [
    '<i class="fas fa-adjust info_item"></i>',
    '<i class="fas fa-ruler info_item"></i>',
    '<div class="info_item"><i class="fas fa-ruler"></i>&ensp;<i class="fas fa-adjust"></i></div>'];

function showInfo(name, globalExtremums, finish) {
    const current = getNumberOfName(name, globalExtremums.length);
    const newElement = document.createElement('tr');
    if(finish) {
        const container = document.getElementById('info');
        container.appendChild(newElement);
        return;
    }
    document.getElementById('info_main').style.display = 'block';

    console.log('globalExtremums ', globalExtremums);

    let depth  = globalExtremums[current].depth.toFixed(2);
    if(depth == 0) {
        depth = '-'
    };
    let distance = globalExtremums[current].distance.toFixed(2);
    if(distance == 0) {
        distance = '-'
    };
    let iconCurrent = current;
    let wFirtstStub ='';
    let wSecondStub ='';
    if(iconCurrent>2) iconCurrent = 2;
    if(iconCurrent<2) {
        wFirtstStub = '-';
        wSecondStub = '-';
    } else {
        wFirtstStub = undefined;
        wSecondStub = undefined;
    }
    newElement.innerHTML =
        '<td>' + iconPopulationTemplates[iconCurrent] + '</td>'
        +'<td>' + depth +' c.u.'+'</td>'
        +'<td>' + distance +' c.u.'+ '</td>'
        +'<td>' + `${wFirtstStub || wFirtst.toFixed(2)}` +'</td>'
        +'<td>' + `${wSecondStub || wSecond.toFixed(2)}` + '</td>'
    ;

    const container = document.getElementById('info');
    container.appendChild(newElement);
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

function getNumberOfName(name, length) {
    switch (name) {
        case 'Depth': return 0;
        case 'Distance': return 1;
        case 'Distance and Depth': return length - 1;
    }
    if(newRules) {
        purposes.push(purpose.generatePurpose('Depth', colorGenesDepth, purposeDepth));
        purposes.push(purpose.generatePurpose('Distance', colorGenesDistance, purposeDistnace));
    }
    purposes.push(purpose.generatePurpose('Distance and Depth', colorGenesDistanceAndDepth, purposeDistnaceAndDepth));
}

init();

