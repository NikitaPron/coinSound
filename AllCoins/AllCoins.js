import {my, allFuturesCoins} from './myCoins.js';
import {Analise} from '../Analise/Analise.js';


const coinsArr = [];
let saves = [];
const anl = new Analise();

function savePrices() {
    coinsArr.forEach(item => {
        const old = saves.find(oldy => oldy.coin === item.coin);
        if(old !== undefined) {
            let procent = ((item.price - old.price) / old.price * 100).toFixed(2);
            item.proc = procent;
        }
    })

    saves = coinsArr.map(a => ({...a}));

    anl.setData(coinsArr);
}

export class AllCoins {

    constructor() {
        this.createStream();
        setInterval(this.createTable, 1000);

        setTimeout(savePrices, 3000);
        this.intervalFunc = setInterval(savePrices, 300000);
    }

    changeInterval(interval) {
        clearInterval(this.intervalFunc);
        this.intervalFunc = setInterval(savePrices, interval);
    }
    

    createStream() {
        const stream = new WebSocket(`wss://stream.binance.com:9443/ws/!bookTicker`);
        document.addEventListener('keydown', (event) => {
            if(event.key === 'q') stream.close();
        })

        stream.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const currCoin = data.s;
            const coinPrice = +data.b;
    
    
            if(allFuturesCoins.includes(currCoin)) {
            const index = this.haveInTable(currCoin);
                if(index === -1) {
                    coinsArr.push(this.createNewCoin(currCoin, coinPrice))
                } else {
                    coinsArr[index].price = coinPrice;
                }
            }
        }

        stream.onclose = function(event) {
            console.log('STREM FROM MAIN TABLE CLOSED' + event.code + '>>>' + event.reason);
            document.querySelector('#START_STREAM').click();
        }
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
        sortTable();
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



// SORT //
document.querySelector('#sortTable').addEventListener('change', (event) => {
    if(event.target.value === 'Alphabet') sortTable = sortAlphabet;
    if(event.target.value === 'Moving') sortTable = sortMoving;
    if(event.target.value === 'High') sortTable = sortHigh;
    if(event.target.value === 'Low') sortTable = sortLow;
})

let sortTable = sortAlphabet;

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
// SORT //




