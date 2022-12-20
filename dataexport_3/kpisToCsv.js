var fs = require('fs');

readData = (fileName) => {
  console.log(`Read ${fileName}`);
  try {
    var data = fs.readFileSync(`./data/kpi/${fileName}`, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
};

buildRows = (stock) => {
  const ticker = stock.ticker;
  const price = stock.price;
  const reports = stock.report;
  const kpis = getKpis(stock);

  let rows = [];
  if (!!kpis && !!price && !!reports) {
    reports.forEach((report) => {
      let row = {};

      row.ticker = stock.ticker;
      row.sectorId = stock.sectorId;
      row.marketId = stock.marketId;
      row.branchId = stock.branchId;

      // Set all the dates
      row.year = report.year;
      row.period = report.period;

      tempDate = new Date(report.report_End_Date);
      tempDate.setMonth(tempDate.getMonth() + 1);
      row.reportEndDate = tempDate;

      Object.keys(kpis).forEach((key) => {
        filteredKpi = kpis[key].filter(
          (kpi) => kpi.y === row.year && kpi.p == row.period
        );
        // console.log(filteredKpi)
        row[key] = !!filteredKpi.length > 0 ? filteredKpi[0].v : null; // TODO how to handle this???
      });

      row['price'] = getPriceForPeriod(row.reportEndDate, price);
      d = new Date(tempDate);
      row['price3'] = getPriceForPeriod(d.setMonth(d.getMonth() + 3), price);
      d = new Date(tempDate);
      row['price6'] = getPriceForPeriod(d.setMonth(d.getMonth() + 6), price);
      d = new Date(tempDate);
      row['price12'] = getPriceForPeriod(d.setMonth(d.getMonth() + 12), price);
      d = new Date(tempDate);
      row['price-3'] = getPriceForPeriod(d.setMonth(d.getMonth() - 3), price);
      d = new Date(tempDate);
      row['price-6'] = getPriceForPeriod(d.setMonth(d.getMonth() - 6), price);
      d = new Date(tempDate);
      row['price-12'] = getPriceForPeriod(d.setMonth(d.getMonth() - 12), price);
      rows.push(row);
    });

    for (let i = 1; i < rows.length; i++) {
      rows[i]['stockChange'] = rows[i - 1].price - rows[i].price;
      rows[i]['stockChangePct'] = rows[i]['stockChange'] / rows[i].price;
    }

    rows.shift();
  }

  return rows;
};

getPriceForPeriod = (d, price) => {
  let close;
  result = price.find((p) => {
    const priceDate = new Date(p.d);
    const date = new Date(d);
    if (date.getFullYear() === priceDate.getFullYear()) {
      if (date.getMonth() === priceDate.getMonth()) {
        if (date.getDate() > priceDate.getDate()) {
          close = p.c;
        } else {
          return !!close ? close : p.c;
        }
      }
    }
  });

  return !!result ? result.c : null;
};

getKpis = (stock) => {
  const kpis = [
    'bruttomarginal',
    'operativtkassaflodesmarginal',
    'vinsttillvaxt',
    'ebittillvaxt',
    'omsattningstillvaxt',
    'vinst/aktie',
    'egetkapital/aktie',
    'fcf/aktie',
    'rorelsemarginal',
    'ebita/aktie',
    'ebit/aktie',
    'operativkassaflode/aktie',
    'aretskassaflode/aktie',
    'vinstmarginal',
    'ebitda/marginal',
    'fcf/Marginal',
    'capex/proc',
    'vinst/fcf',
    'omsattning/aktie',
    'fcf/proc',
  ];

  let filteredKpi = {};

  kpis.forEach((kpi) => {
    if (!!stock[kpi]) {
      filteredKpi[kpi] = stock[kpi];
    } else {
      return null;
    }
  });

  return filteredKpi;
};

const files = fs.readdirSync('./data/kpi/');
const allData = [];
let counter = 1;
files.forEach((file) => {
  // allData.push(buildRows(readData(file)));
  buildRows(readData(file)).forEach((r) => {
    allData.push(r);
  });

  console.log(counter);
  counter++;
});

let toPrint = {
  rows: [
    [
      'ticker',
      'year',
      'period',
      'reportEndDate',
      'sectorId',
      'marketId',
      'branchId',
      'bruttomarginal',
      'operativtkassaflodesmarginal',
      'vinsttillvaxt',
      'ebittillvaxt',
      'omsattningstillvaxt',
      'vinst/aktie',
      'egetkapital/aktie',
      'fcf/aktie',
      'rorelsemarginal',
      'ebita/aktie',
      'ebit/aktie',
      'operativkassaflode/aktie',
      'aretskassaflode/aktie',
      'vinstmarginal',
      'ebitda/marginal',
      'fcf/Marginal',
      'capex/proc',
      'vinst/fcf',
      'omsattning/aktie',
      'fcf/proc',
      'price',
      'price3',
      'price6',
      'price12',
      'price-3',
      'price-6',
      'price-12',
      'stockChange',
      'stockChangePct',
    ],
  ],
};

allData.forEach((data) => {
  const temp = [
    data['ticker'],
    data['year'],
    data['period'],
    data['reportEndDate'],
    data['sectorId'],
    data['marketId'],
    data['branchId'],
    data['bruttomarginal'],
    data['operativtkassaflodesmarginal'],
    data['vinsttillvaxt'],
    data['ebittillvaxt'],
    data['omsattningstillvaxt'],
    data['vinst/aktie'],
    data['egetkapital/aktie'],
    data['fcf/aktie'],
    data['rorelsemarginal'],
    data['ebita/aktie'],
    data['ebit/aktie'],
    data['operativkassaflode/aktie'],
    data['aretskassaflode/aktie'],
    data['vinstmarginal'],
    data['ebitda/marginal'],
    data['fcf/Marginal'],
    data['capex/proc'],
    data['vinst/fcf'],
    data['omsattning/aktie'],
    data['fcf/proc'],
    data['price'],
    data['price3'],
    data['price6'],
    data['price12'],
    data['price-3'],
    data['price-6'],
    data['price-12'],
    data['stockChange'],
    data['stockChangePct'],
  ];
  toPrint.rows.push(temp);
});

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
  });
});

let csv = `${lol.join('\n').replace(/,/g, ',')}`;
csv = csv.replace(new RegExp(`${stringToReplaceComas}`, 'g'), ',');

fs.promises
  .mkdir(`./export/`, { recursive: true })
  .then(
    fs.writeFile(`./export/kpi.csv`, csv, 'utf8', function (err) {
      if (err) {
        console.log(
          'Some error occured - file either not saved or corrupted file saved.'
        );
      } else {
        console.log(`Export saved`);
      }
    })
  )
  .catch(console.error);
