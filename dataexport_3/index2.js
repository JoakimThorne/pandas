axios = require('axios');
var fs = require('fs');

const key = 'abbd3cbb15e04949908988cf6278b5c9';
const from = '2019-05-23';
const to = '1970-01-01';

// Get all instruments
axios
  .get(`https://apiservice.borsdata.se/v1/instruments?authKey=${key}`) // not sharing that. ;)
  .then((response) => {
    buildPrices(response.data.instruments);
  })
  .catch((error) => {
    console.log(error);
  });

// data: list of all instruments
buildPrices = (data) => {
  promiseList = [];
  reqCounter = 0;
  data.forEach((element) => {
    if (
      element.countryId === 1 && // sweden
      element.instrument === 0
    ) {
      // && // { //  stocks
      // reqCounter < 3) {  // Don't be a prick, take one
      // 861 results
      promiseList.push(getPrice(element, reqCounter));
      reqCounter++;
    }
  });

  (async () => {
    var result = await Promise.all(promiseList.map((p) => p.catch((e) => e)));

    // Sort the list
    const sortBy = (fn) => (a, b) => -(fn(a) < fn(b)) || +(fn(a) > fn(b));
    const getName = (o) => o.ticker;
    const sortByName = sortBy(getName);

    result.sort(sortByName);

    result.map(getName);

    let data = result.reduce((r, e) => {
      if (!!e && !!e.ticker) {
        let group = e.ticker[0];
        if (!r[group]) r[group] = { group, children: [e] };
        else r[group].children.push(e);
        return r;
      }
    }, {});

    let katt = Object.values(data);
    katt.forEach((k) => {
      test(k.group, k.children);
    });
  })();
};

getPrice = (stock, i) => {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      // axios.get(`https://apiservice.borsdata.se/v1/instruments/${stock.insId}/stockprices?authKey=${key}&from=${from}&to=${to}`)
      axios
        .get(
          `https://apiservice.borsdata.se/v1/instruments/${stock.insId}/stockprices?authKey=${key}`
        )
        .then((response) => {
          stock.price = response.data.stockPricesList;
          console.log(i);
          resolve(stock);
        })
        .catch((error) => {
          reject();
        });
    }, i * 1200);
  });
};

test = (group, data) => {
  let toPrint = {
    rows: [
      [
        'date',
        'symbol',
        'high',
        'low',
        'close',
        'open',
        'volume',
        'sectorId',
        'marketId',
        'branchId',
      ],
    ],
  };

  data.forEach((stock) => {
    // "d": "string",
    // "h": 0,
    // "l": 0,
    // "c": 0,
    // "o": 0,
    // "v": 0
    if (!!stock && !!stock.price) {
      stock.price.forEach((eod) => {
        const temp = [
          eod.d !== null ? eod.d : 'undefined',
          stock.ticker !== null ? stock.ticker : 'undefined',
          eod.h !== null ? eod.h : 'undefined',
          eod.l !== null ? eod.l : 'undefined',
          eod.c !== null ? eod.c : 'undefined',
          eod.o !== null ? eod.o : 'undefined',
          eod.v !== null ? eod.v : 'undefined',
          stock.sectorId !== null ? stock.sectorId : 'undefined',
          stock.marketId !== null ? stock.marketId : 'undefined',
          stock.branchId !== null ? stock.branchId : 'undefined',
        ];
        toPrint.rows.push(temp);
      });
    }
  });

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
    });
  });

  let csv = `${lol.join('\n').replace(/,/g, ',')}`;
  // // or like this
  // let csv = `"${myObj.rows.join('"\n"').split(',').join('","')}"`;

  csv = csv.replace(new RegExp(`${stringToReplaceComas}`, 'g'), ',');

  // // 2. Another way - if you don't need the double quotes in the generated csv and you don't have comas in rows' values
  // let csv = myObj.rows.join('\n')

  fs.writeFile(`./data/${group}.csv`, csv, 'utf8', function (err) {
    if (err) {
      console.log(
        'Some error occured - file either not saved or corrupted file saved.'
      );
    } else {
      console.log(`Group ${group} is saved!`);
    }
  });
  // });
};

const chunk = (arr, size) =>
  arr.reduce(
    (acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]),
    []
  );
