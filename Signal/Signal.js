const audio = new Audio('sound.wav');
export class Signal {
    
    constructor(coin, needPrice, comment) {
        this.coin = coin;
        this.needPrice = needPrice;
        this.stream = this.createStream(coin);
        this.div = this.createDiv();
        this.comment = comment;
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
        if(currentPrice < needPrice) {
            return 'UP'
        } else {
            return 'DOWN';
        }
    }

    updateInfo() {
        this.div.innerHTML = `${this.coin.toUpperCase()}: ${this.currentPrice} (до цены ${this.needPrice}: ${getPercent(this.currentPrice, this.needPrice)}%)     (${this.comment})`;
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
            this.stream.close();
            signal.remove();
        })

        signal.append(signalText, btnDelete);
        document.querySelector('.signals').append(signal);

        return signalText;
    }
}


function getPercent(currPrice, needPrice) {
    const percent = ((needPrice - currPrice) / currPrice * 100).toFixed(3);
    return percent;
}