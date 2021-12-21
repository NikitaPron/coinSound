import {my} from './myCoins.js';

let signals = [];
let audio = new Audio('sound.wav');


function startStream(coin, updateFunc) {
    const stream = new WebSocket(`wss://stream.binance.com:9443/ws/${coin}@bookTicker`);
    stream.onmessage = function(event) {
        let data = JSON.parse(event.data);
        let bestPrice = data.b;
        updateFunc(bestPrice);
        console.log(coin);
    }
    return stream;
}

function createSignal() {

    let obj = {
        coin: getNeedCoin(),
        currPrice: 0,
        needPrice: getNeedPrice(),
        upOrDown: getUpOrDown(),
        div: createDiv(signals.length),
        update: '',
        stream: '',
    }
    obj.update = function(bestPrice) {
        obj.currPrice = bestPrice;
        updateUI(obj.div, obj.currPrice, obj.needPrice, obj.coin);
        if(checkWatching(obj.upOrDown, obj.currPrice, obj.needPrice)) {
            audio.play();
            obj.div.classList.add('completedSignal');
        };
    },
    obj.stream = startStream(obj.coin, obj.update);

    signals.push(obj);
}



function createDiv(index) {
    const signal = document.createElement('div');
    signal.classList.add('signalDiv');

    const signalText = document.createElement('div');
    signalText.classList.add('signalText');

    const btnDelete = document.createElement('button');
    btnDelete.classList.add('btnDeleteSignal');
    btnDelete.innerHTML = 'Delete';

    btnDelete.addEventListener('click', () => {
        signals[index].stream.close();
        signals[index] = '';
        signal.remove();
    })

    document.querySelector('.signals').append(signal);
    signal.append(signalText, btnDelete);

    return signalText;
}


function updateUI(div, prc, needPrice, needCoin) {
    let percent = ((needPrice - prc) / prc * 100).toFixed(3);
    div.innerHTML = `${needCoin.toUpperCase()}: ${+prc} (до цены: ${percent}%)`;
}


// INPUT SETTERS
function getNeedCoin() {
    const input = document.querySelector('#needCoin');
    return input.value.toLowerCase();
}

function getNeedPrice() {
    const input = document.querySelector('#needPrice');
    return parseFloat(input.value);
}

function getUpOrDown() {
    let text = document.querySelector('.activeUpDown').innerHTML;
    if(text === 'Жду вверх') {
        return 'up';
    } else {
        return 'down';
    }
}
// INPUT SETTERS



function checkWatching(upOrDown, prc, needPrice) {
    if(upOrDown === 'up' && prc >= needPrice) {
        return true;
    }

    if(upOrDown === 'down' && prc <= needPrice) {
        return true;
    }

    return false;
}


function clearAll() {
    signals.forEach(signal => {
        if(signal !== '') {
            signal.stream.close();
        }
    });
    signals = [];
    Array.from(document.querySelectorAll('input')).forEach(inp => inp.value = '');
    document.querySelector('.signals').innerHTML = '';
}


// KEYHANDLERS


document.addEventListener('keydown', (event) => {
    if(event.key === 'F2') {
        clearAll()
    }
})

document.addEventListener('click', (event) => {
    if(event.target.classList.contains('btnDown')) {
        document.querySelector('.btnUp').classList.remove('activeUpDown');
        event.target.classList.add('activeUpDown');
    }

    if(event.target.classList.contains('btnUp')) {
        document.querySelector('.btnDown').classList.remove('activeUpDown');
        event.target.classList.add('activeUpDown');
    }
})


const btnStart = document.querySelector('#btnStart');
btnStart.addEventListener('click', () => {
    createSignal();
});

// KEYHANDLERS



const allPrices = document.querySelector('.allPrices');

const allDiv = document.createElement('div');
allPrices.append(allDiv);

const myDiv = document.createElement('div');
allPrices.append(myDiv);

const arr = [];
let saves = [];
const stream = new WebSocket(`wss://stream.binance.com:9443/ws/!bookTicker`);
stream.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if(data.s.endsWith('USDT')) {
        const isHave = arr.findIndex(item => item.ticker === data.s);
        if( isHave === -1) {
            arr.push({
                ticker: data.s,
                price: +data.b,
                proc: '',
            })
        } else {
            arr[isHave].price = +data.b;
        }
    }
}

setInterval(savePrices, 60000);

function savePrices() {
    arr.forEach(item => {
        let old = saves.find(oldy => oldy.ticker === item.ticker);
        if(old !== undefined) {
            let procent = ((old.price - item.price) / item.price * 100).toFixed(2);
            item.proc = procent;
        }
    })

    saves = arr.map(a => ({...a}));
}

setInterval(showAll, 2000);

function showAll() {
    arr.sort((a, b) => a.ticker > b.ticker ? 1 : -1);
    allDiv.innerHTML = '';
    myDiv.innerHTML = '';

    arr.forEach((item, index) => {
        createTickerDiv(item, index);
    })
}


function createTickerDiv(ticker, index) {
    const tickerDiv = document.createElement('div');
    tickerDiv.classList.add('tickerDiv');

    const tickerText = document.createElement('div');
    tickerText.classList.add('ticker');
    tickerText.innerHTML = index+1 + '. ' + ticker.ticker;

    const priceText = document.createElement('div');
    priceText.classList.add('price');
    priceText.innerHTML = ticker.price;

    const percentText = document.createElement('div');
    percentText.innerHTML = ticker.proc;
    percentText.classList.add(ticker.proc > 0 ? 'percentUp' : 'percentDown');
    

    tickerDiv.append(tickerText, priceText, percentText);



    if(my.includes(ticker.ticker)) {
        myDiv.append(tickerDiv);
    } else {
        allDiv.append(tickerDiv);
    }
}

document.addEventListener('keydown', (event) => {
    if(event.key === 'q') stream.close();
})