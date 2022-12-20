axios = require('axios');
var fs = require('fs');

const key = '6bae26f23b5540188afa3ad65af8786e'
const from = '2019-03-01';
const to = '1970-01-01';


// Get all instruments
axios.get(`https://apiservice.borsdata.se/v1/instruments?authKey=${key}`) // not sharing that. ;)
    .then((response) => {
        buildPrices(response.data.instruments)
    })
    .catch(error => {
        console.log(error);
    });


// data: list of all instruments
buildPrices = (data) => {

    promiseList = [];
    reqCounter = 0;
    console.log('Fetched ' + data.length + ' instruments');
    data.forEach((element) => {
        if (element.countryId == 1 && // sweden
            element.instrument == 0) {// && // { //  stocks
            // reqCounter < 3) {  // Don't be a prick, take one
            // 861 results
            // getPrice(element, reqCounter);
            getPrice(element, reqCounter);
            reqCounter++;
        }
    });

    // (async () => {
    //     var result = await Promise.all(promiseList.map(p => p.catch(e => e)));

    // Sort the list
    // const sortBy = fn => (a, b) => -(fn(a) < fn(b)) || +(fn(a) > fn(b));
    // const getName = o => o.ticker;
    // const sortByName = sortBy(getName);

    // result.sort(sortByName);

    // result.map(getName);



    // let data = result.reduce((r, e) => {
    //     if (!!e && !!e.ticker) {
    //         let group = e.ticker[0];
    //         if (!r[group]) r[group] = { group, children: [e] }
    //         else r[group].children.push(e);
    //         return r;
    //     }
    // }, {})

    // let katt = Object.values(data)
    // katt.forEach(k => {
    //     test(k.group, k.children);
    // });

    // result.forEach(r => {
    //     console.log(r)
    //     test(r);
    // });

    // })();

}

getPrice = (stock, i) => {
    // return new Promise(function (resolve, reject) {
    setTimeout(() => {
        console.log(`Fetch price for ${stock.ticker}, index = ${i}`);
        // axios.get(`https://apiservice.borsdata.se/v1/instruments/${stock.insId}/stockprices?authKey=${key}&from=${from}&to=${to}`)
        axios.get(`https://apiservice.borsdata.se/v1/instruments/${stock.insId}/stockprices?authKey=${key}`)
            .then((response) => {
                stock.price = response.data.stockPricesList;
                console.log(`Price fetched for ${stock.ticker} at index = ${i}, now save it!`);
                // resolve(stock);
                // console.log(stock)
                test(stock)
            })
            .catch(error => {
                console.log(error);
            })
    }, i * 1200);
    // });
}



test = (data) => {
    let toPrint = {
        "rows": [
            [
                "date",
                "high",
                "low",
                "close",
                "open",
                "volume",
                "highPct",
                "lowPct",
                "closePct",
                "openPct",
                "volumePct",
                "sectorId",
                "marketId",
                "branchId",
            ],
        ]
    }

    if (!!data && !!data.price) {
        data.price.reverse().forEach((eod, index) => {
            if (index > 0) {
                const temp = [
                    eod.d !== null ? eod.d : null,
                    eod.h !== null ? +eod.h : null,
                    eod.l !== null ? +eod.l : null,
                    eod.c !== null ? +eod.c : null,
                    eod.o !== null ? +eod.o : null,
                    eod.v !== null ? +eod.v : null,
                    eod.h !== null ? ((+data.price[index].h / +data.price[index - 1].h) - 1) * 100 : null,
                    eod.h !== null ? ((+data.price[index].l / +data.price[index - 1].l) - 1) * 100 : null,
                    eod.h !== null ? ((+data.price[index].c / +data.price[index - 1].c) - 1) * 100 : null,
                    eod.h !== null ? ((+data.price[index].o / +data.price[index - 1].o) - 1) * 100 : null,
                    eod.h !== null ? ((+data.price[index].v / +data.price[index - 1].v) - 1) * 100 : null,
                    data.sectorId !== null ? +data.sectorId : null,
                    data.marketId !== null ? +data.marketId : null,
                    data.branchId !== null ? +data.branchId : null];
                toPrint.rows.push(temp);
            }
        });
        data.price.reverse();
    }

    // 1. One way - if you want the results to be in double quotes and you have comas inside

    // choose another string to temporally replace commas if necessary
    let stringToReplaceComas = '!!!!';
    lol = toPrint.rows;
    // lol = chunk(toPrint.rows, 100000);

    // console.log(lol);
    // lol.forEach((l, i) => {
    lol.map((singleRow) => {
        // console.log('singleRow', singleRow);
        singleRow.map((value, index) => {
            singleRow[index] = value.toString().replace(/,/g, stringToReplaceComas);
        })
    })

    let csv = `${lol.join('\n').replace(/,/g, ',')}`;
    // // or like this
    // let csv = `"${myObj.rows.join('"\n"').split(',').join('","')}"`;

    csv = csv.replace(new RegExp(`${stringToReplaceComas}`, 'g'), ',');

    // // 2. Another way - if you don't need the double quotes in the generated csv and you don't have comas in rows' values
    // let csv = myObj.rows.join('\n')
    const ticker = data.ticker.replace(' ', '-');
    const branchId = data.branchId;

    fs.promises.mkdir(`./data/${branchId}`, { recursive: true })
    .then(
        fs.writeFile(`./data/${branchId}/${ticker}.csv`, csv, 'utf8', function (err) {
            if (err) {
                console.log('Some error occured - file either not saved or corrupted file saved.');
            } else {
                console.log(`Group ${ticker} is saved!`);
            }
        })
    )
    .catch(console.error);


    // });

}

// const chunk = (arr, size) =>
//     arr
//         .reduce((acc, _, i) =>
//             (i % size)
//                 ? acc
//                 : [...acc, arr.slice(i, i + size)]
//             , [])


