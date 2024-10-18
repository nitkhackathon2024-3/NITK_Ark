import yfinance as yf
from flask import request, render_template, jsonify, Flask

app = Flask(__name__, template_folder='templates')



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_stock_data', methods=['POST'])
def get_stock_data():
    ticker = request.get_json()['ticker']
    data = yf.Ticker(ticker).history(period='1y')
    stock = yf.Ticker(ticker)
    pe_ratio = stock.info.get('forwardPE')
    beta = stock.info.get('beta', None)
    balance_sheet = stock.get_balance_sheet()
    total_assets = balance_sheet.loc['TotalAssets'][0]
    total_liabilities = balance_sheet.loc['TotalLiabilitiesNetMinorityInterest'][0] 
    market_cap = stock.info.get('marketCap')

    #print(data.dtypes)
    return jsonify({'currentPrice': data.iloc[-1].Close,
                    'openPrice': data.iloc[-1].Open,
                    'pe_ratio': pe_ratio,
                    'beta': beta,
                    'total_assets': total_assets,
                    'total_liabilities': total_liabilities,
                    'market_cap': market_cap

                    })

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
