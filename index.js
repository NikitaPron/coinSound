import { Signal } from './Signal/Signal.js';
import * as Storage from './storage.js';


const signals = Storage.getSignals() || [];

if(signals.length > 0) {
    signals.forEach(signal => {
        new Signal(signal.coin, signal.needPrice, signal.comment);
    });
}

function createSignal() {
    const signal = new Signal(getNeedCoin(), getNeedPrice(), getComment());
    console.log('dasda');
    signals.push({
        coin: signal.coin,
        needPrice: signal.needPrice,
        comment: signal.comment,
    });

    Storage.saveSignals(signals);
}

// INPUT SETTERS
function getNeedCoin() {
    const input = document.querySelector('#needCoin');
    return input.value.toLowerCase();
}

function getNeedPrice() {
    const input = document.querySelector('#needPrice');
    return +input.value;
}

function getComment() {
    const input = document.querySelector('#signalComment');
    return input.value;
}
// INPUT SETTERS


function clearAll() {
    Array.from(document.querySelectorAll('input')).forEach(inp => inp.value = '');
    signals.forEach(signal => signal.stream.close());
}


// KEYHANDLERS

document.addEventListener('keydown', (event) => {
    if(event.key === 'F2') {
        clearAll();
        Storage.clearSignals();
    }
})

document.addEventListener('click', (event) => {
    if(event.target.classList.contains('ticker')) {
        const input = document.querySelector('#needCoin');
        input.value = trimNumberOfTicker(event.target.innerHTML);
    }
        

    if(event.target.classList.contains('price')) {
        const input = document.querySelector('#needPrice');
        input.value = +event.target.innerHTML;
    }

})


document.querySelector('#btnStart').addEventListener('click', createSignal);

// KEYHANDLERS



function trimNumberOfTicker(ticker) {
    let index = ticker.split('').findIndex(item => item === '.');
    return ticker.slice(index + 2);
}