import {AllCoins} from './AllCoins/AllCoins.js';
import {findBigVolume} from './FindBigVolumes/findBigVolume.js';
import { Signal } from './Signal/Signal.js';
import * as storage from './storage.js';


const signals = [];

function createSignal() {
    const signal = new Signal(getNeedCoin(), getNeedPrice(), getComment());
    signals.push({
        coin: signal.coin,
        needPrice: signal.needPrice,
        comment: signal.comment,
    });
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
        clearAll()
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

document.addEventListener('click', (event) => {
    if(event.target.classList.contains('ticker')) {
        let coin = trimNumberOfTicker(event.target.innerHTML);
        new findBigVolume(coin, 10000);
    }
})

document.querySelector('#btnStart').addEventListener('click', createSignal);

// KEYHANDLERS




function trimNumberOfTicker(ticker) {
    let index = ticker.split('').findIndex(item => item === '.');
    return ticker.slice(index + 2);
}


const table = new AllCoins();