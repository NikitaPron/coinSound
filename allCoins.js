import {my} from './myCoins.js';

export function createTable() {
    const allPrices = document.querySelector('.allPrices');

    const allDiv = document.createElement('div');
    allPrices.append(allDiv);
    
    const myDiv = document.createElement('div');
    allPrices.append(myDiv);
    
    const arr = [];
    let saves = [];
    const stream = new WebSocket(`wss://stream.binance.com:9443/ws/!bookTicker`);
    
    let functionSort = sortAlphabet;
    
    stream.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if(data.s.endsWith('USDT') && !data.s.endsWith('UPUSDT') && !data.s.endsWith('DOWNUSDT')) {
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
        functionSort();
    
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
    
    
        my.includes(ticker.ticker) ? myDiv.append(tickerDiv) : allDiv.append(tickerDiv);
    }
    
    
    document.addEventListener('keydown', (event) => {
        if(event.key === 'q') stream.close();
        if(event.key === 'h') functionSort = sortHigh;
        if(event.key === 'v') functionSort = sortMoving;
        if(event.key === 'l') functionSort = sortLow;
        if(event.key === 'a') functionSort = sortAlphabet;
    })
    
    
    function sortAlphabet() {
        arr.sort((a, b) => a.ticker > b.ticker ? 1 : -1);
    }
    
    function sortMoving() {
        arr.sort((a, b) => Math.abs(b.proc) - Math.abs(a.proc));
    }
    
    function sortHigh() {
        arr.sort((a, b) => b.proc - a.proc);
    }
    
    function sortLow() {
        arr.sort((a, b) => a.proc - b.proc);
    }
}




