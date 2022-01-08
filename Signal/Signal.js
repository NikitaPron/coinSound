import * as Storage from '../storage.js'

export const signals = [];




const audio = new Audio('sound.wav');
export class Signal {
    
    constructor(coin, needPrice, comment, id) {
        this.id = id;
        this.coin = coin;
        this.needPrice = needPrice;
        this.stream = this.createStream(coin);
        this.div = this.createDiv();
        this.comment = comment;
        this.percent;


        signals.push({
            id,
            coin,
            needPrice,
            comment,
        })

        Storage.saveSignals(signals);
    }

    deleteSignal() {
        this.stream.close();
        const index = signals.findIndex(item => item.id === this.id);
        this.div.remove();
        signals.splice(index, 1);
        Storage.saveSignals(signals);
    }

    isSignalCompleted() {
        if(this.trend === 'UP' && this.currentPrice >= this.needPrice) {
            return true;
        }

        if(this.trend === 'DOWN' && this.currentPrice <= this.needPrice) {
            return true;
        }

        return false;
    }

    isDown(currentPrice, needPrice) {
        return currentPrice < needPrice ? 'UP': 'DOWN';
    }

    updateInfo() {
        this.percent = getPercent(this.currentPrice, this.needPrice);
        this.div.children[0].innerHTML = 
        
        `<span class='coinName'>${this.coin.toUpperCase()}</span>:
         <span class='currentPrice'>${this.currentPrice}</span>
         (до цены <span class='needPrice'>${this.needPrice}</span>:
         <span class='percentTo'>${this.percent}%</span>)
         (<span class='signalComment'>${this.comment}</span>)`;

        if(this.isSignalCompleted()) {
            this.completeSignal();
        }
    }


    completeSignal() {
        audio.play();
        this.div.classList.add('completedSignal');
    }

    createStream(coin) {
        const stream = new WebSocket(`wss://stream.binance.com:9443/ws/${coin}@bookTicker`);
        stream.onmessage = (event) =>  {
            let data = JSON.parse(event.data);
            this.currentPrice = +data.b;
            if(!this.trend) this.trend = this.isDown(this.currentPrice, this.needPrice);
            this.updateInfo();
        }

        return stream;
    }


    createDiv() {
        const signal = document.createElement('div');
        signal.classList.add('signalDiv');
    
        const signalText = document.createElement('div');
        signalText.classList.add('signalText');

        const btnDelete = document.createElement('button');
        btnDelete.classList.add('btnDeleteSignal');
        btnDelete.innerHTML = 'Delete';

        btnDelete.addEventListener('click', () => {
            this.deleteSignal();
        });

        signal.append(signalText, btnDelete);
        document.querySelector('.signals').append(signal);

        return signal;
    }
}


function getPercent(currPrice, needPrice) {
    const percent = ((needPrice - currPrice) / currPrice * 100).toFixed(3);
    return percent;
}


(function initSignalsFromStorage() {
    const storage = Storage.getSignals() || [];
    if(storage.length > 0) storage.forEach(signal => new Signal(signal.coin, signal.needPrice, signal.comment, signal.id));
})()