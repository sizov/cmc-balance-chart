$(document).ready(function () {
    var CMC_TIME_FORMAT = 'DD-MM-YYYY HH:mm:ss',
        CMC_DATE_HEADER = 'Date / Time',
        CMC_BALANCE_HEADER = 'Balance(GBP)',
        HEADER_SEPARATOR = ',',
        CELLS_SEPARATOR = '\",\"',
        CHART_DOM_SELECTOR = '.chart';

    var balanceSeriesData = [],
        highchartsOptions = {
            title: {
                text: 'CMC Account Balance'
            },
            subtitle: {
                text: 'Chart of account balance based on CMC Markets exported CSV data'
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: CMC_DATE_HEADER
                }
            },
            yAxis: {
                title: {
                    text: CMC_BALANCE_HEADER
                },
                min: 0
            },
            tooltip: {
                headerFormat: '<b>{point.y:.2f}</b><br>',
                pointFormat: '{point.x:%A, %b %e, %H:%M:%S}'
            },

            plotOptions: {
                series: {
                    animation: false
                },
                spline: {
                    marker: {
                        enabled: true
                    }
                }
            },

            series: [
                {
                    name: CMC_BALANCE_HEADER,
                    data: balanceSeriesData
                }
            ]
        };

    function parseDate(dateString) {
        var parsed = moment(dateString, CMC_TIME_FORMAT);
        return parsed.valueOf();
    }

    function parseBalance(balanceString) {
        return parseFloat(balanceString);
    }

    function cleanString(string) {
        if (!string || string.length === 0) return string;

        var lastSymbol = string[string.length] - 1,
            firstSymbol = string[0];

        if (lastSymbol === '"' || lastSymbol === '\'') {
            string = string.slice(0, string.length - 1);
        }
        if (firstSymbol === '"' || firstSymbol === '\'') {
            string = string.slice(1, string.length - 1);
        }

        return string;
    }

    function compareDates(dateA, dateB) {
        if (dateA === dateB) {
            return 0;
        }

        if (dateA < dateB) {
            return -1;
        }

        return 1;
    }

    function processCsvFile(csv) {
        // Split the lines
        var lines = csv.split('\n');

        //get Date and Balance headers
        var headerLine = lines[0],
            headers = headerLine.split(HEADER_SEPARATOR),
            dateHeaderIndex,
            balanceHeaderIndex;

        $.each(headers, function (itemNo, header) {
            header = cleanString(header);

            if (header === CMC_DATE_HEADER) {
                dateHeaderIndex = itemNo;
            }
            else if (header === CMC_BALANCE_HEADER) {
                balanceHeaderIndex = itemNo;
            }
        });


        // Iterate over the lines and add categories or series
        $.each(lines, function (lineNo, line) {
            var lineItems = line.split(CELLS_SEPARATOR);

            // header line contains categories
            if (lineNo !== 0) {
                var dateUnparsed,
                    balanceUnparsed,
                    dateParsed,
                    balanceParsed;

                dateUnparsed = cleanString(lineItems[dateHeaderIndex]);
                balanceUnparsed = cleanString(lineItems[balanceHeaderIndex]);

                dateParsed = parseDate(dateUnparsed);
                balanceParsed = parseBalance(balanceUnparsed);

                if (!isNaN(balanceParsed)) {
                    balanceSeriesData.push([dateParsed, balanceParsed]);
                }
            }

        });

        //sort array, we know that feach element is Date/Balance pair, so let's sort by date
        balanceSeriesData.sort(function (a, b) {
            return compareDates(a[0], b[0])
        });

        $(CHART_DOM_SELECTOR).highcharts(highchartsOptions);
    }

    //uncomment if you want to use local demo file
//    var CSV_LINK = 'data/History.csv';
//    $.get(CSV_LINK, processCsvFile);

    function handleFileSelect(evt) {
        var files = evt.target.files,
            file = files[0],
            reader = new FileReader();

        reader.onload = function (e) {
            var fileContent = e.target.result;
            processCsvFile(fileContent);
        };

        // Read in the file
        reader.readAsText(file);
    }

    if (window.File && window.FileReader && window.FileList && window.Blob) {
        document.getElementById('file').addEventListener('change', handleFileSelect, false);
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

});