// @ts-ignore
const threads = require('worker_threads');
const { performance } = require('perf_hooks');
const { Worker } = threads;


let pool = {};
let peplesWithoutPair = {};
let roundCounter = 0;
let sitPeopleCount = 0
let confirmedHisPair = 0
let roundPeople = 0
let waitingTime = 0
let _socket = null
let peopleCount = 0

function HallInit(socket) {
    startTimer('Excecution Time')

    _socket = socket;
    resetHall();

    startTimer('createWorkersTime')
    for (let i = 0; i < peopleCount ; i++) {
        const worker = addPersonToHall();
        assignPersonListeners(worker)        
    }
    endTimer('createWorkersTime', 'Create Workers Time: %t s');
    
    startRound();
}


function resetHall() {
    peopleCount = Math.floor(Math.random() * 1000);
    peplesWithoutPair = {};
    roundCounter = 0;
    sitPeopleCount = 0
    confirmedHisPair = 0
    roundPeople = 0
    waitingTime = 0
    Object.keys(pool).forEach(i => {
        pool[i].terminate();
    });
    pool = {}

    socketEmit('PeopleCount', peopleCount)
    log(`\n\npeopleCount: ${peopleCount} \n`);
}

function addPersonToHall() {
    const worker = new Worker('./people.js');
    socketEmit('NewPerson', { id: worker.threadId })
    pool[worker.threadId] = worker;
    return worker;
}
function assignPersonListeners(worker) {
    worker.on('message', (message) => {
        if (!message.type) {
            console.error('Unknown message type...')
        }

        if (message.type === 'TRANSFER') {
            const threadId = message.threadId;
            if (message.data.type === 'SendMyCounter') {
                socketEmit('changeCounter', { id: threadId, counter: message.data.data })
            }
            pool[threadId].postMessage(message.data);
        }

        if (message.type === 'IFoundPair') {
            socketEmit('changeStatus', { id: worker.threadId, status: 'found' })
            confirmedHisPair++;
            startRound();
        }

        if (message.type === 'IAmSit') {
            socketEmit('changeStatus', { id: worker.threadId, status: 'sit' })
            sitPeopleCount++;

            delete pool[worker.threadId];
            worker.terminate();

            startRound();
        }

        if (message.type === 'IAmLastPerson') {
            endTimer('Excecution Time', 'Excecution Time: %t s')
            socketEmit('changeStatus', { id: worker.threadId, status: 'result' })
            socketEmit('Finish', null)
            log(`Count of people is : ${message.data + Object.keys(peplesWithoutPair).length} from ${peopleCount}`);
            log(`Sum of waitingTime all people: ${waitingTime / 1000}s`)
        }

        if (message.type === 'Timer') {
            waitingTime += message.data;
        }
    });
}

function areWeReadyToNextRound() {
    return sitPeopleCount === roundPeople / 2 && confirmedHisPair === roundPeople
}

function startRound() {
    if (!areWeReadyToNextRound()) {
        return
    }

    if (roundCounter > 0) {
        endTimer('RoundTime', 'RoundTimer: %t s')
    }
    startTimer('RoundTime')

    //Add peplesWithoutPair from previous round if exists
    pool = { ...pool, ...peplesWithoutPair };

    const poolIds = Object.keys(pool);

    if (poolIds.length === 1) {
        log("Calculation eneded! \n");
        const lastPeople = Object.values(pool)[0];
        lastPeople.postMessage({ type: "SayYourCounter" });
        return true;
    }

    if (poolIds.length === 0) {
        log('Empty Auditory');
        socketEmit('Finish', null)
        return true;
    }

    sitPeopleCount = 0;
    confirmedHisPair = 0;
    peplesWithoutPair = {};

    //Check if we have peplesWithoutPair and exclude him from this round
    if (poolIds.length % 2 === 1) {
        const shiftedId = poolIds.shift();
        peplesWithoutPair[shiftedId] = Object.assign(pool[shiftedId]);
        delete pool[shiftedId];
    }
    socketEmit('reoundPersons', poolIds)
    roundPeople = Object.keys(pool).length;

    poolIds.forEach(id => {
        socketEmit('changeStatus', { id: id, status:'finding' })
        pool[id].postMessage({ type: "StartNewRound", poolIds });
    })
    log(`Round: ${roundCounter++}, roundPeople: ${roundPeople}, shiftedPeople: ${Object.keys(peplesWithoutPair).length}`);
    
}

function socketEmit(messageType, data) {
    _socket.emit(messageType, data)
}

function log(data) {
    console.log(data)
    socketEmit('log', data)
}

const timers = {};

function startTimer(label) {
    timers[label] = performance.now();
}

function endTimer(label, logMessage = null) {
    if (!timers[label]) {
        return '--'
    }

    const time = ((performance.now() - timers[label]) / 1000).toFixed(2)
    delete timers[label];

    if (logMessage) {
        log(logMessage.replace('%t', time))
    }

    return time;
}
module.exports = HallInit;