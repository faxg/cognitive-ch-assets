var XLSX = require('xlsx');
var fs = require('fs');
var argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('export', 'Export conversation spreadsheet to intent.csv / entity.csv files.')
    .command('json','Export to json')
    .default('i', 'chatbot.xlsx')
    .describe('i', 'Specify input file (MS Excel format)')
    .alias('i', 'inputSpreadsheet')
    .default('o', './')
    .describe('o', 'Output folder for .csv files. Defaults to current directory.')
    .alias('o', 'outputPath')
    .help('h')
    .alias('h', 'help')
    .argv;


var inputFilename = argv.i || 'chatbot.xlsx';
var outputPath = argv.o || './';

try {
    var workbook = XLSX.readFile(inputFilename, function(err) {
        if (err) {
            return console.log(err);
        }
    });
} catch (e) {
    return console.log ('Could not load input spreadsheet '+ inputFilename);
}


var sheet_name_list = workbook.SheetNames;
sheet_name_list.forEach(function(sheetName) { /* iterate through sheets */
    var worksheet = workbook.Sheets[sheetName];
    var outFile = '';
    if (sheetName.toLowerCase().includes('#intents')) {
        outFile = outputPath + 'intents.csv';
    }
    if (sheetName.toLowerCase().includes('@entities')) {
        outFile = outputPath + 'entities.csv';
    }
    // if we have a valid out file, parse sheet to csv and write file
    if (outFile) {
        console.log('Processing worksheet ' + sheetName);
        console.log('Writing to file: ' + outFile);
        var data = XLSX.utils.sheet_to_csv(worksheet, {});

        fs.writeFile(outFile, data, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("ok");
        });

    }

    // for (key in worksheet) {
    //   /* all keys that do not begin with "!" correspond to cell addresses */
    //   if(key[0] === '!') continue;
    //   console.log(sheetName + "!" + key + "=" + JSON.stringify(worksheet[key].v));
    // }
});
