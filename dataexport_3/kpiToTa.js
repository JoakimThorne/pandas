TA = require('ta-math');
var fs = require('fs');


readData = (fileName) => {
    console.log(`Read ${fileName}`);
    try {
        var data = fs.readFileSync(`./data/kpi/${fileName}`, 'utf8')
        return JSON.parse(data);
    } catch (err) {
        return null
    }
}

buildTa = (price) => {

    // const ohlcv = [[t,o,h,l,c,v], [t2,o2,h2,l2,c2,v2],  ...  ,[tN,oN,hN,lN,cN,vN]];
    //     const ta = new TA(ohlcv, TA.exchangeFormat);
    //     const emaShort = ta.ema(10);
    //     const emaLong = ta.ema(21);
    //     const bband = ta.bb(15, 2);
    //     const bbUpper = bband.upper;
    //     const bbLower = bband.lower;
    //     const smaOpenPrice = TA.sma(ta.$open);

    let ohlcv = [];
    price.forEach(p => {
        ohlcv.push([new Date(p.d), p.o, p.h, p.l, p.c, p.v]);
    });
    // console.log(ohlcv)

    const ta = new TA(ohlcv, TA.exchangeFormat);
    const sma10 = ta.sma(10);
    const sma20 = ta.sma(20);
    const sma50 = ta.sma(50);
    const sma100 = ta.sma(100);
    const vwap = ta.vwap();
    const bband = ta.bb(20, 2);
    const bbmid = bband.middle
    const bbUpper = bband.upper;
    const bbLower = bband.lower;
    const cci = ta.cci();
    const roc = ta.roc();
    const rsi = ta.rsi();

    console.log(sma10.length)
    console.log(sma20.length)
    console.log(sma50.length)
    console.log(sma100.length)
    console.log(vwap.length)
    console.log(bbUpper.length)
    console.log(bbLower.length)
    console.log(cci.length)
    console.log(roc.length)
    console.log(rsi.length)
    
    result = [];
    for(let i = 0; i < ohlcv.length; i++) {
        temp = ohlcv[i];
        temp.push(sma10[i]);
        temp.push(sma20[i]);
        temp.push(sma50[i]);
        temp.push(sma100[i]);
        temp.push(vwap[i]);
        temp.push(bbmid[i]);
        temp.push(bbUpper[i]);
        temp.push(bbLower[i]);
        temp.push(cci[i]);
        temp.push(roc[i]);
        temp.push(rsi[i]);
        // temp.push(rsi[i]);
        // temp.push(rsi[i]);
        // temp.push(rsi[i]);
        // temp.push(rsi[i]);
        // temp.push(rsi[i]);
        // temp.push(rsi[i]);

        result.push(temp)
    }
    return result;
}

const files = fs.readdirSync('./data/kpi/');
const allData = []
let counter = 1;
// files.forEach(file => {

//     if ()
//     // allData.push(buildRows(readData(file)));
//     console.log(readData(file))

// })

data = buildTa(readData('HM B.json').price);

console.log(data);


let toPrint = {
    "rows": [
        [
            "date",
            "open",
            "high",
            "low",
            "close",
            "vol",
            "sma10",
            "sma20",
            "sma50",
            "sma100",
            "vwap",
            "bbmid",
            "bbUpper",
            "bbLower",
            "cci",
            "roc",
            "rsi"
        ],
    ]
};

data.forEach(d => {
    const temp = [d];
    toPrint.rows.push(temp);
})

let stringToReplaceComas = '!!!!';
lol = toPrint.rows;

lol.map((singleRow) => {
    // console.log('singleRow', singleRow);
    singleRow.map((value, index) => {
        if (!!value) {
            singleRow[index] = value.toString().replace(/,/g, stringToReplaceComas);
        } else {
            singleRow[index] = ''.replace(/,/g, stringToReplaceComas);
        }
    })
})

let csv = `${lol.join('\n').replace(/,/g, ',')}`;
csv = csv.replace(new RegExp(`${stringToReplaceComas}`, 'g'), ',');

fs.promises.mkdir(`./export/`, { recursive: true })
    .then(
        fs.writeFile(`./export/stockPrice.csv`, csv, 'utf8', function (err) {
            if (err) {
                console.log('Some error occured - file either not saved or corrupted file saved.');
            } else {
                console.log(`Export saved`);
            }
        })
    )
    .catch(console.error);



