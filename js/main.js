$(document).ready(function () {

    /**
     * proper timeformat for cmc markets CSV: moment('07.03.2015 22:36:36,100', 'DD-MM-YYYY HH:mm:ss,SSS')
     */

    var CMC_TIME_FORMAT = 'DD-MM-YYYY HH:mm:ss',
        CMC_DATE_HEADER = 'Date / Time',
        CMC_BALANCE_HEADER = 'Balance(GBP)',
        balanceSeriesData = [],
        CSV_LINK = 'data/History.csv',// 'data-cmc.csv';
        HEADER_SEPARATOR = ',',
        CELLS_SEPARATOR = '\",\"',
        CHART_DOM_SELECTOR = '.chart';


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


    var highchartsOptions = {
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


    $.get(CSV_LINK, function (csv) {
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

        $(CHART_DOM_SELECTOR).highcharts(highchartsOptions);
    });


});