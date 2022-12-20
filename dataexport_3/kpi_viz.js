axios = require('axios');
var fs = require('fs');

const key = 'abbd3cbb15e04949908988cf6278b5c9';

let reqCounter = 1;
const REQ_TIMEOUT = 180;

// Get all instruments
main = () => {
  axios
    .get(`https://apiservice.borsdata.se/v1/instruments?authKey=${key}`) // not sharing that. ;)
    .then((response) => {
      data = response.data.instruments;

      // Load all the data
      data.forEach((d, i) => {
        temp = readData(d.ticker);
        data[i] = temp ? temp : d;
      });

      buildPrices(data);
    })
    .catch((error) => {
      console.log(error);
    });
};

readData = (ticker) => {
  console.log(`Read ${ticker}`);

  try {
    var data = fs.readFileSync(`./data/kpi/${ticker}.json`, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
};

// // data: list of all instruments
buildPrices = (data) => {
  promiseList = [];
  console.log('Fetched ' + data.length + ' instruments');
  data.forEach((element) => {
    if (
      element.countryId == 1 && // sweden
      element.instrument == 0
    ) {
      //&& //) {// && // { //  stocks
      // reqCounter < 3) {  // Don't be a prick, take one
      // 861 results

      getPrice(element);
      getQuarter(element);
      getReport(element);
    }
  });

  setTimeout(() => {
    data.forEach((d) => storeData(d));
  }, reqCounter * REQ_TIMEOUT);
};

getPrice = (stock) => {
  setTimeout(() => {
    console.log(`Fetch price for ${stock.ticker}, index = ${reqCounter}`);
    axios
      .get(
        `https://apiservice.borsdata.se/v1/instruments/${stock.insId}/stockprices?authKey=${key}`
      )
      .then((response) => {
        stock.price = response.data.stockPricesList;
        console.log(`Price fetched for ${stock.ticker}`);
      })
      .catch((error) => {
        console.log(error);
      });
  }, reqCounter * REQ_TIMEOUT);
  reqCounter++;
};

getQuarter = (stock) => {
  let kpis = [
    ['Bruttomarginal', 28],
    ['EBITDA/Marginal', 32],
    ['Rorelsemarginal', 29],
    ['Vinstmarginal', 30],
    ['OperativtKassaflodesMarginal', 51],
    ['FCF/Marginal', 31],
    ['Capex/Proc', 25],
    ['Vinst/FCF', 27],
    ['OmsattningMkr', 53],
    ['BruttoresultatMkr', 135],
    ['EBITDA/Mkr', 54],
    ['VinstForeSkattMkr', 125],
    ['VinstMkr', 56],
    ['OperativKassaflodeMkr', 62],
    ['RorelseresultatMkr', 55],
    ['CapexMkr', 64],
    ['KassaflodeFinansieringMkr', 138],
    ['AretsKassaflodeMkr', 65],
    ['FrittKassaflodeMkr', 63],
    ['Vinsttillvaxt', 97],
    ['EBITTillvaxt', 96],
    ['Omsattningstillvaxt', 94],
    ['Omsattning/Aktie', 5],
    ['Vinst/Aktie', 6],
    ['EgetKapital/Aktie', 8],
    ['FCF/Aktie', 23],
    ['EBITA/Aktie', 71],
    ['EBIT/Aktie', 70],
    ['OperativKassaflode/Aktie', 68],
    ['AretsKassaflode/Aktie', 69],
    ['AretsKassaflodeMarginal', 140],
    ['FCF/Proc', 24],
  ];

  kpis.forEach((kpi) => {
    if (!!!stock[kpi[0].toString().toLowerCase().split(' ').join('')]) {
      setTimeout(() => {
        console.log(`Fetch quarter kpis for ${stock.ticker}, kpi = ${kpi[0]}`);
        axios
          .get(
            `https://apiservice.borsdata.se/v1/instruments/${stock.insId}/kpis/${kpi[1]}/quarter/mean/history?authKey=${key}`
          )
          .then((response) => {
            console.log(`${kpi[0]} fetched for ${stock.ticker}, saving!`);

            stock[kpi[0].toString().toLowerCase().split(' ').join('')] =
              response.data.values;
            storeData(stock);
          })
          .catch((error) => {
            console.log(error);
          });
      }, reqCounter * REQ_TIMEOUT);
      reqCounter++;
    }
  });
};

getReport = (stock) => {
  if (!!!stock['report']) {
    setTimeout(() => {
      console.log(`Fetch report for ${stock.ticker}, index = ${reqCounter}`);
      axios
        .get(
          `https://apiservice.borsdata.se/v1/instruments/${stock.insId}/reports/quarter?authKey=${key}`
        )
        .then((response) => {
          console.log(
            `Report fetched for ${stock.ticker} at index = ${reqCounter}, now save it!`
          );

          stock['report'] = response.data.reports;

          storeData(stock);
        })
        .catch((error) => {
          console.log(error);
        });
    }, reqCounter * REQ_TIMEOUT);
    reqCounter++;
  }
};

storeData = (d) => {
  fs.promises
    .mkdir(`./data/kpi/`, { recursive: true })
    .then(
      fs.writeFile(
        `./data/kpi/${d.ticker}.json`,
        JSON.stringify(d, null, 2),
        function (err) {
          if (err) {
            console.log(
              'Some error occured - file either not saved or corrupted file saved.'
            );
          } else {
            console.log(`Group ${d.ticker} is saved!`);
          }
        }
      )
    )
    .catch(console.error);
};

main();
