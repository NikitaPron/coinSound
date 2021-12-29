export class Analise {
    constructor() {
        this.result = [];
    }

    setData(newArr) {

        newArr.forEach(item => {
        const index = haveInTable(this.result, item.coin);
            if(index === -1) {
                if(item.proc > 0.5 || item.proc < -0.5) {
                    this.result.push({...item, counter: 0});
                } 
            } else {
                const curr = this.result[index];
                curr.counter++;
                curr[`proc${curr.counter}`] = item.proc;
            }
        });

        this.counter++;
        this.showData();
    }

    showData() {
        this.result.forEach(item => {
            console.log(item);
        })

    }
}


function haveInTable(arr, coin) {
    return arr.findIndex(item => item.coin === coin);
}