let money = 100;
const futurePrices = new Map();

(function startStream() {
    const futWS = new WebSocket('wss://fstream.binance.com/ws/!bookTicker');
    console.log('STREAM ALL STARTED');


    futWS.onmessage = function(event) {
        const data = JSON.parse(event.data);
        futurePrices.set(data.s, +data.b);

        for (let i = 0; i < deals.length; i++) {
            const deal = deals[i];
            if(deal.coin === data.s) {
                if(deal.status === "PENDING" || deal.status === 'TIMEWAIT') {
                    deal.checkProfit(+data.b);
                }
            }
        }

    }
    
    futWS.onclose = function(event) {
        console.log('CLOSE STREAM: ' + event.code);
        startStream();
    }

    futWS.onerror = function(event) {
        console.log('ERROR STREAM: ' + event.code);
    }
})();


export class Analise {
    constructor() {
        this.result = [];
    }

    setData(newArr) {
        newArr.forEach(item => {

            if(item.proc > 0.7 || item.proc < -0.7) {


                if(deals.length % 10 === 0 && deals.length > 0) {
                    profit = getBestProc();
                    if(profit < 0.5) profit = 0.5;
                }

                const deal = new Deal(item);
                deal.addDeal();
            }
        });
    }
}

let deals = [];

let stopLose = 0.3;
let profit = 0.519;

class Deal {
    constructor(obj) {
        this.coin = obj.coin;
        this.deal = obj.proc < 0 ? 'LONG' : 'SHORT';
        this.price = obj.price;
        this.BUYprice = futurePrices.get(obj.coin);
        this.status = 'PENDING';
        this.firstPercent = parseFloat(obj.proc, 10);
        this.percProfit = 0;
        this.maxPROFIT = 0;
    }

    addDeal() {
        deals.push(this);
        countProfit();
    }


    changeMaxPROFIT(percent) {
        if(this.deal === 'LONG' && percent > this.maxPROFIT) {
            this.maxPROFIT = percent;
        }

        if(this.deal === 'SHORT' && percent < this.maxPROFIT) {
            this.maxPROFIT = percent;
        }
    }

    checkProfit(newPrice) {

        let perc = getPercent(this.BUYprice, newPrice);
        this.changeMaxPROFIT(perc);

        if(this.status !== 'PENDING') return;


        if(this.deal === 'LONG') {
            if(perc > profit) {
                this.status = 'PROFIT';
                this.percProfit = perc;


                this.status = 'TIMEWAIT';
                setTimeout(() => {
                    this.status = 'PROFIT';
                    countProfit();
                }, 300000);


                money += (Math.abs(this.percProfit) - 0.1);
                countProfit();
            }
            if(perc < -stopLose) {
                this.status = 'STOPLOSE';
                this.percProfit = perc;

                money -= (Math.abs(this.percProfit) + 0.1);
                countProfit();
            }
        }

        if(this.deal === 'SHORT') {
            if(perc < -profit) {
                this.status = 'PROFIT';
                this.percProfit = perc;
                

                this.status = 'TIMEWAIT';
                setTimeout(() => {
                    this.status = 'PROFIT';
                    countProfit();
                }, 300000);

                money += (Math.abs(this.percProfit) - 0.1);
                countProfit();
            }
            if(perc > stopLose) {
                this.status = 'STOPLOSE';
                this.percProfit = perc;

                money -= (Math.abs(this.percProfit) + 0.1);
                countProfit();
            }
        }
    }
}


function countProfit() {

    
    let stats = {
        profitLong: 0,
        profitShort: 0,
        stopLong: 0,
        stopShort: 0,
        timewait: 0,
        pending: 0,
        up03: 0,
        percentProfit: '',
        percentProfit03: '',
        middlePlus: '',
        bestProc: getBestProc(),
        dollars: money.toFixed(2) + '$',
        currentBestProcProfit: profit,
    }

    let sumForMiddle = 0;
    let counter = 0;

    deals.forEach(item => {
        if(item.status === 'TIMEWAIT') stats.timewait++;
        if(item.status === 'PENDING') stats.pending++;
        if(item.status === 'PROFIT' && item.deal === 'SHORT') stats.profitShort++;
        if(item.status === 'PROFIT' && item.deal === 'LONG') stats.profitLong++;
        if(item.status === 'STOPLOSE' && item.deal === 'SHORT') stats.stopShort++;
        if(item.status === 'STOPLOSE' && item.deal === 'LONG') stats.stopLong++;
        if(item.status === 'STOPLOSE' && Math.abs(item.maxPROFIT) > 0.3) stats.up03++;

        if(item.status === 'PROFIT') {
            sumForMiddle += Math.abs(item.maxPROFIT);
            counter++;
        }
    })
    
    stats.percentProfit = ((stats.profitLong+stats.profitShort+stats.timewait) / (stats.stopLong+stats.stopShort+stats.profitLong+stats.profitShort+stats.timewait) * 100).toFixed(2);
    stats.percentProfit03 = ((stats.profitLong+stats.profitShort+stats.timewait+stats.up03) / (stats.stopLong+stats.stopShort+stats.profitLong+stats.profitShort+stats.timewait) * 100).toFixed(2);
    stats.middlePlus = (sumForMiddle / counter).toFixed(3);
    

    console.log(deals);
    console.log(stats);
}

// HELPERS

function getPercent(currPrice, needPrice) {
    const percent = ((needPrice - currPrice) / currPrice * 100).toFixed(3);
    return parseFloat(percent, 10);
}
// HELPERS



function getBestProc() {
    const filtredDeals = deals.filter(i => i.status !== 'PENDING');

    let bestRes = filtredDeals.length*-0.4;
    let bestItem = 0;

    filtredDeals.forEach(item => {
        let countPlus = 0;
        let countMinus = 0;

        filtredDeals.forEach(elem => {
            if(Math.abs(elem.maxPROFIT) >= Math.abs(item.maxPROFIT)) {
                countPlus += Math.abs(item.maxPROFIT) - 0.1;
            } else {
                countMinus += 0.4;
            }
        })

        console.log(countPlus.toFixed(3) + '>>>' + countMinus.toFixed(3) + '>>>' + Math.abs(item.maxPROFIT));

        if ((countPlus - countMinus) > bestRes) {
            bestRes = countPlus - countMinus;
            bestItem = Math.abs(item.maxPROFIT);
        }

    })
    
    return bestItem;

}


