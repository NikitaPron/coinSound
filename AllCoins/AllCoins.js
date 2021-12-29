import {my} from './myCoins.js';


const coinsArr = [];
let saves = [];

function savePrices() {
    coinsArr.forEach(item => {
        const old = saves.find(oldy => oldy.coin === item.coin);
        if(old !== undefined) {
            let procent = ((old.price - item.price) / item.price * 100).toFixed(2);
            item.proc = procent;
        }
    })

    saves = coinsArr.map(a => ({...a}));
}

document.addEventListener('keydown', (event) => {
    if(event.key === 'h') sortHigh();
    if(event.key === 'v') sortMoving();
    if(event.key === 'l') sortLow();
    if(event.key === 'a') sortAlphabet();
})


function sortAlphabet() {
    coinsArr.sort((a, b) => a.coin > b.coin ? 1 : -1);
}

function sortMoving() {
    coinsArr.sort((a, b) => Math.abs(b.proc) - Math.abs(a.proc));
}

function sortHigh() {
    coinsArr.sort((a, b) => b.proc - a.proc);
}

function sortLow() {
    coinsArr.sort((a, b) => a.proc - b.proc);
}


export class AllCoins {

    constructor() {
        this.createStream();
        setInterval(this.createTable, 1000);
        this.intervalFunc = setInterval(savePrices, 10000);
    }

    changeInterval(interval) {
        clearInterval(this.intervalFunc);
        this.intervalFunc = setInterval(savePrices, interval);
    }
    

    createStream() {
        const stream = new WebSocket(`wss://stream.binance.com:9443/ws/!bookTicker`);
        document.addEventListener('keydown', (event) => {
            if(event.key === 'q') this.stream.close();
        })

        stream.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const currCoin = data.s;
            const coinPrice = +data.b;


            if(currCoin.endsWith('USDT') && !currCoin.endsWith('UPUSDT') && !currCoin.endsWith('DOWNUSDT')) {
            const index = this.haveInTable(currCoin);
                if(index === -1) {
                    coinsArr.push(this.createNewCoin(currCoin, coinPrice))
                } else {
                    coinsArr[index].price = coinPrice;
                }
            }
        }

        return stream;
    }

    createNewCoin(coin, price) {
        return {
            coin,
            price,
            proc: 0,
        }
    }

    haveInTable(coin) {
        return coinsArr.findIndex(item => item.coin === coin);
    }

    createTable() {
        sortAlphabet();
        const allPrices = document.querySelector('.allPrices');
        allPrices.innerHTML = '';

        const allCoinsDiv = createNewDiv('', '', allPrices);
        const myCoinsDiv = createNewDiv('', '', allPrices);

        coinsArr.forEach((item, index) => {
            if(my.includes(item.coin)) {
                myCoinsDiv.append(createCell(index+1 + '. ' + item.coin, item.price, item.proc));
            } else {
                allCoinsDiv.append(createCell(index+1 + '. ' + item.coin, item.price, item.proc));
            }
        })
    }
}

function createCell(ticker, price, proc) {
    const tickerDiv = createNewDiv('tickerDiv');
    createNewDiv('ticker', ticker, tickerDiv);
    createNewDiv('price', price, tickerDiv);
    createNewDiv(proc > 0 ? 'percentUp' : 'percentDown', proc, tickerDiv);
    return tickerDiv;
}


function createNewDiv(className, text, parent) {
    const div = document.createElement('div');
    if(className) div.classList.add(className);
    if(text) div.innerHTML = text;
    if(parent) parent.append(div);
    return div;
}

export function getCurrPriceCoin(coin) {
    let need = coinsArr.find(item => item.coin === coin);
    return need.price;
}



