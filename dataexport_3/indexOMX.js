axios = require('axios');
var fs = require('fs');

const key = '6bae26f23b5540188afa3ad65af8786e'
const from = '2019-03-01';
const to = '1970-01-01';


// Get all instruments
axios.get(`https://www.nordnet.se/graph/indicator/OM/OMXS30?from=1970-01-01&to=2019-03-25&fields=last,open,high,low`) // not sharing that. ;)
    .then((response) => {
        buildPrices(response.data)
    })
    .catch(error => {
        console.log(error);
    });


// data: list of all instruments
buildPrices = (data) => {

    console.log('Fetched ' + data + ' instruments');

    let toPrint = {
        "rows": [
            [
                "date",
                "high",
                "low",
                "close",
                "open"
            ],
        ]
    };

    data.forEach((eod, index) => {
        if (index > 0) {
            console.log(eod);
            const temp = [
                eod.date !== null ? eod.time : '',
                eod.high !== null ? +eod.high : '',
                eod.low !== null ? +eod.low : '',
                eod.close !== null ? +eod.last : '',
                eod.open !== null ? +eod.open : ''];
            toPrint.rows.push(temp);
        }
        // console.log(eod)
    });
    data.reverse();

    // 1. One way - if you want the results to be in double quotes and you have comas inside

    // choose another string to temporally replace commas if necessary
    let stringToReplaceComas = '!!!!';
    lol = toPrint.rows;
    // lol = chunk(toPrint.rows, 100000);

    // console.log(lol);
    // lol.forEach((l, i) => {
    lol.map((singleRow) => {
        console.log('singleRow', singleRow);
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
    const ticker = 'OMXS30';
    const branchId = 'OMXS30';

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
}




// test = (data) => {

//     }

//     if (!!data && !!data.price) {

//     }

//     // 1. One way - if you want the results to be in double quotes and you have comas inside

//     // choose another string to temporally replace commas if necessary
//     let stringToReplaceComas = '!!!!';
//     lol = toPrint.rows;
//     // lol = chunk(toPrint.rows, 100000);

//     // console.log(lol);
//     // lol.forEach((l, i) => {
//     lol.map((singleRow) => {
//         // console.log('singleRow', singleRow);
//         singleRow.map((value, index) => {
//             singleRow[index] = value.toString().replace(/,/g, stringToReplaceComas);
//         })
//     })

//     let csv = `${lol.join('\n').replace(/,/g, ',')}`;
//     // // or like this
//     // let csv = `"${myObj.rows.join('"\n"').split(',').join('","')}"`;

//     csv = csv.replace(new RegExp(`${stringToReplaceComas}`, 'g'), ',');

//     // // 2. Another way - if you don't need the double quotes in the generated csv and you don't have comas in rows' values
//     // let csv = myObj.rows.join('\n')
//     const ticker = data.ticker.replace(' ', '-');
//     const branchId = data.branchId;

//     fs.promises.mkdir(`./data/${branchId}`, { recursive: true })
//     .then(
//         fs.writeFile(`./data/${branchId}/${ticker}.csv`, csv, 'utf8', function (err) {
//             if (err) {
//                 console.log('Some error occured - file either not saved or corrupted file saved.');
//             } else {
//                 console.log(`Group ${ticker} is saved!`);
//             }
//         })
//     )
//     .catch(console.error);


//     // });

// }

// const chunk = (arr, size) =>
//     arr
//         .reduce((acc, _, i) =>
//             (i % size)
//                 ? acc
//                 : [...acc, arr.slice(i, i + size)]
//             , [])


