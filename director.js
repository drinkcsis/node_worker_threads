// @ts-ignore
const threads = require('worker_threads');
const { Worker } = threads;


let pool = {};
let peplesWithoutPair = {};
let roundCounter = 0;
let sitPeopleCount = 0
let confirmedHisPair = 0
let roundPeople = 0
let waitingTime = 0

const peopleCount = Math.floor(Math.random() * 1000);

init();

function init() {
    console.log(`peopleCount: ${peopleCount} \n`);

    console.time('createWorkers Time')
    console.time('CommonTime')
    for (let i = 0; i < peopleCount ; i++) {
        const worker = new Worker('./people.js');
        pool[worker.threadId] = worker;

        worker.on('message', (message) => {
            if (!message.type) {
                console.error('Unknown message type...')
            }

            if (message.type === 'TRANSFER') {
                const threadId = message.threadId;
                pool[threadId].postMessage(message.data);
            }

            if (message.type === 'IFoundPair') {
                confirmedHisPair++;
                startRound();
            }

            if (message.type === 'IAmSit') {
                sitPeopleCount++;

                delete pool[worker.threadId];
                worker.terminate();
                
                startRound();
            }

            if (message.type === 'IAmLastPerson') {
                console.log(`Count of people is : ${message.data + Object.keys(peplesWithoutPair).length} from ${peopleCount}`);
                console.timeEnd('CommonTime')
                console.log(`waitingTime: ${waitingTime / 1000}s`)
                // @ts-ignore
                process.exit(0);
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

    if (roundCounter > 0)
        console.timeEnd('RoundTime')
    console.time('RoundTime')

    pool = { ...pool, ...peplesWithoutPair };
    const poolIds = Object.keys(pool);

    if (poolIds.length === 0) {
        console.log('Empty Auditory');
        // @ts-ignore
        process.exit(0);
    }


    if (poolIds.length === 1) {
        console.log("Calculation eneded! \n");
        // @ts-ignore
        const lastPeople = Object.values(pool)[0];
        lastPeople.postMessage({ type: "SayYourCounter" });
        return true;
    }

    sitPeopleCount = 0;
    confirmedHisPair = 0;
    peplesWithoutPair = {};

    if (poolIds.length % 2 === 1) {
        const shiftedId = poolIds.shift();
        peplesWithoutPair[shiftedId] = Object.assign(pool[shiftedId]);
        delete pool[shiftedId];
    }
    roundPeople = Object.keys(pool).length;

    poolIds.forEach(id => {
        pool[id].postMessage({ type: "ThisIsPool", data: poolIds });
    })
    console.log(`Round: ${roundCounter++}, roundPeople: ${roundPeople}, shiftedPeople: ${Object.keys(peplesWithoutPair).length}`);
}