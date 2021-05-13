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

function reset(socket) {
    _socket = socket;
    peopleCount = Math.floor(Math.random() * 400);
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

function DirectorInit(socket) {
    reset(socket);

    console.time('createWorkers Time')
    console.time('CommonTime')
    
    for (let i = 0; i < peopleCount ; i++) {
        const worker = new Worker('./people.js');
        socketEmit('NewPerson', { id: worker.threadId })
        pool[worker.threadId] = worker;

        worker.on('message', (message) => {
            if (!message.type) {
                console.error('Unknown message type...')
            }

            if (message.type === 'TRANSFER') {
                const threadId = message.threadId;
                if (message.data.type === 'getMyCounter') {
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
                console.timeEnd('CommonTime')
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
    console.timeEnd('createWorkers Time')
    startRound();
}

function areWeReadyToNextRound() {
    return sitPeopleCount === roundPeople / 2 && confirmedHisPair === roundPeople
}

function startRound() {
    if (!areWeReadyToNextRound()) {
        return
    }

    if (roundCounter > 0) {
        log(`RoundTimer: ${endTimer('RoundTime')}s`);
    }
    startTimer('RoundTime')

    //Add peplesWithoutPair from previous round if exists
    pool = { ...pool, ...peplesWithoutPair };

    const poolIds = Object.keys(pool);

    if (poolIds.length === 0) {
        log('Empty Auditory');
        socketEmit('Finish', null)
        return true;
    }


    if (poolIds.length === 1) {
        log("Calculation eneded! \n");
        const lastPeople = Object.values(pool)[0];
        lastPeople.postMessage({ type: "SayYourCounter" });
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
    roundPeople = Object.keys(pool).length;

    poolIds.forEach(id => {
        socketEmit('changeStatus', { id: id, status:'finding' })
        pool[id].postMessage({ type: "ThisIsPool", data: poolIds });
    })
    const roundInfo = `Round: ${roundCounter++}, roundPeople: ${roundPeople}, shiftedPeople: ${Object.keys(peplesWithoutPair).length}`;
   
    socketEmit('reoundPersons', poolIds)
    log(roundInfo);
    
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

function endTimer(label) {
    if (!timers[label]) {
        return '--'
    }

    const time = (performance.now() - timers[label]) / 1000
    delete timers[label];
    return time.toFixed(2);
}
module.exports = DirectorInit;