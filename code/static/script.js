var tickers = JSON.parse(localStorage.getItem('tickers')) || [];
let lastPrices = {};
let counter = 15;

function startUpdateCycle() {
    updatePrices();
    setInterval(function () {
        counter--;
        $('#counter').text(counter);
        if (counter <= 0) {
            updatePrices();
            counter = 15;
        }
    }, 1000);
}

$(document).ready(function () {
    // Initialize tickers on load
    tickers.forEach(function (ticker) {
        addTickerToGrid(ticker);
    });
    updatePrices();

    // Form submission to add a new ticker
    $('#add-ticker-form').submit(function (e) {
        e.preventDefault();
        var newTicker = $('#new-ticker').val().toUpperCase();
        if (!tickers.includes(newTicker)) {
            tickers.push(newTicker);
            localStorage.setItem('tickers', JSON.stringify(tickers));
            addTickerToGrid(newTicker);
            $('#new-ticker').val('');
            updatePrices();
        } else {
            console.warn(`Ticker ${newTicker} already exists.`);
        }
    });

    // Remove ticker from the grid
    $('#tickers-grid').on('click', '.remove-btn', function () {
        var tickerToRemove = $(this).data('ticker');
        tickers = tickers.filter(t => t !== tickerToRemove);
        localStorage.setItem('tickers', JSON.stringify(tickers));
        $(`#${tickerToRemove}`).remove();
    });

    startUpdateCycle();
});

function addTickerToGrid(ticker) {
    $('#tickers-grid').append(`
        <div id="${ticker}" class="stock-box">
            <h2>${ticker}</h2>
            <p id="${ticker}-price">  Price</p>
            <p id="${ticker}-pct"> Change Percent </p>
            <p id="${ticker}-pe">  P/E Ratio</p>
            <p id="${ticker}-beta">  Beta</p>
            <p id="${ticker}-total_assets">  total_assets</p>
            <p id="${ticker}-total_liabilities">  total_liabilities</p>
            <p id="${ticker}-market_cap">  market_cap</p>

            <button class="remove-btn" data-ticker="${ticker}">REMOVE</button>
        </div>
    `);
}

function updatePrices() {
    tickers.forEach(function (ticker) {
        $.ajax({
            url: '/get_stock_data',
            type: 'POST',
            data: JSON.stringify({ 'ticker': ticker }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (data) {
                // Check for valid data
                if (!data.currentPrice || !data.openPrice || !data.pe_ratio || !data.total_assets || !data.total_liabilities || !data.market_cap) {
                    console.error(`Invalid data for ${ticker}:`, data);
                    return;
                }

                var changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100;
                var colorClass = determineColorClass(changePercent);
                var pe_ratio = data.pe_ratio;
                var beta = data.beta;
                var total_assets = data.total_assets;
                var total_liabilities = data.total_liabilities;
                var market_cap = data.market_cap;

                // Update the price and percentage display
                $(`#${ticker}-price`).text( `PRICE:   $${data.currentPrice.toFixed(2)}`)
                    .removeClass('dark-red red gray green dark-green')
                    .addClass(colorClass);

                $(`#${ticker}-pct`).text(`CHANGE %:   ${changePercent.toFixed(2)}%`)
                    .removeClass('dark-red red gray green dark-green')
                    .addClass(colorClass);
                
                $(`#${ticker}-pe`).text(`P/E RATIO:   ${pe_ratio.toFixed(2)}`)
                    .removeClass('dark-red red gray green dark-green')
                    .addClass(colorClass);

                $(`#${ticker}-beta`).text(`BETA:   ${beta}`)
                    .removeClass('dark-red red gray green dark-green')
                    .addClass(colorClass);

                $(`#${ticker}-total_assets`).text(`TOTAL ASSETS:   ${total_assets}`)
                    .removeClass('dark-red red gray green dark-green')
                    .addClass(colorClass);

                $(`#${ticker}-total_liabilities`).text(`TOTAL LIABILITY:   ${total_liabilities}`)
                    .removeClass('dark-red red gray green dark-green')
                    .addClass(colorClass);

                $(`#${ticker}-market_cap`).text(`MARKET CAP:   ${market_cap}`)
                    .removeClass('dark-red red gray green dark-green')
                    .addClass(colorClass);

                // Flash effect based on price change
                var flashClass = determineFlashClass(ticker, data.currentPrice);
                lastPrices[ticker] = data.currentPrice;
                $(`#${ticker}`).addClass(flashClass);
                setTimeout(function () {
                    $(`#${ticker}`).removeClass(flashClass);
                }, 1000);
            },
            error: function () {
                console.error(`Failed to fetch data for ticker: ${ticker}`);
            }
        });
    });
}

function determineColorClass(changePercent) {
    if (changePercent <= -2) return 'dark-red';
    if (changePercent < 0) return 'red';
    if (changePercent === 0) return 'gray';
    if (changePercent <= 2) return 'green';
    return 'dark-green';
}

function determineFlashClass(ticker, currentPrice) {
    if (lastPrices[ticker] > currentPrice) return 'red-flash';
    if (lastPrices[ticker] < currentPrice) return 'green-flash';
    return 'gray-flash';
}
