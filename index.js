import {Signal } from './Signal/Signal.js';
import * as Storage from './Storage/storage.js';





function createSignal() {
    new Signal(getNeedCoin(), getNeedPrice(), getComment(), getId());
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



function getId() {
    
    const symbols = '1234567890qwertyuiopasdfghjklzxcvbnm';
    const newId = new Array(10).fill(1).map(() => {
        return symbols[getRandomInt(0, symbols.length)];
    }).join('');

    return newId;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}