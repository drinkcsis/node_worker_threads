// @ts-ignore
const threads = require('worker_threads');

let poolIds = [];
let counter = 1;
let pairId = null;
let connectedWithPair = false;

threads.parentPort.on('message', message => {
    if (!message.type) {
        console.error('Unknown message type...')
    }

    if (message.type === 'ThisIsPool') {
        poolIds = message.data;
        imitateTimeForFindingPair();
    }

    if (message.type === 'IAmYourPair') {
        pairId = message.data;
        threads.parentPort.postMessage({ type: 'IFoundPair' })
        whoShouldSit();
    }

    if (message.type === 'getMyCounter') {
        counter += message.data;
    }

    if (message.type === 'youShouldSit') {
        threads.parentPort.postMessage({
            type: 'TRANSFER', threadId: message.data,
            data: {
                type: "getMyCounter", data: counter
            }
        });
        threads.parentPort.postMessage({ type: "IAmSit" })
    }

    if (message.type === 'SayYourCounter') {
        threads.parentPort.postMessage({ type: 'IAmLastPerson', data: counter })
    }    
});

function connectWithOwnPair() {
    if (poolIds.length > 1) {
        const myIndex = poolIds.indexOf(threads.threadId.toString());
        const parentIndex = myIndex >= (poolIds.length / 2) ? myIndex - (poolIds.length / 2) : myIndex + (poolIds.length / 2);
        
        threads.parentPort.postMessage({
            type: 'TRANSFER', threadId: poolIds[parentIndex],
            data: {
                type: "IAmYourPair", data: threads.threadId
            }
        });
    }
}

function imitateTimeForFindingPair() {
    const delayTime = Math.floor(Math.random() * 10) > 5 ? Math.floor(Math.random() * 100) : 0;
    threads.parentPort.postMessage({ type: 'Timer', data: delayTime });
    setTimeout(function () {
        connectWithOwnPair()
        connectedWithPair = true;
        whoShouldSit();
    }, delayTime);
}

function whoShouldSit() {
    //Run only if we recived partnerId and sent own id to partner.
    if (pairId && connectedWithPair) {
       
        whoSitBasedOnDice()
        // whoSitBasedOnId()

        //Reset flags for next round
        connectedWithPair = false
        pairId = null

    }
}

function whoSitBasedOnId() {
    if (threads.threadId < pairId) {
        threads.parentPort.postMessage({
            type: 'TRANSFER', threadId: pairId,
            data: {
                type: "getMyCounter", data: counter
            }
        });
        threads.parentPort.postMessage({ type: "IAmSit" })
    }
}

function whoSitBasedOnDice() {
    if (threads.threadId < pairId) {
        const dice = Math.floor(Math.random() * 2);
        threads.parentPort.postMessage({
            type: 'TRANSFER', threadId: dice ? pairId : threads.threadId,
            data: {
                type: "youShouldSit", data: dice ? threads.threadId : pairId
            }
        });
    }
}

function dd(...args) {
    console.log(`=${threads.threadId}=>`, ...args);
}