import yfinance as yf

def get_pe_ratio(stock_symbol):
    # Fetch the stock data
    stock = yf.Ticker(stock_symbol)
    
    # Get the P/E ratio
    pe_ratio = stock.info.get('forwardPE')  # or use 'trailingPE' for trailing P/E
    return pe_ratio

# Example usage
stock_symbol = 'AAPL'  # Use TCS.NS for TCS listed on NSE
pe_ratio = get_pe_ratio(stock_symbol)

if pe_ratio is not None:
    print(f"The P/E ratio for {stock_symbol} is: {pe_ratio}")
else:
    print("Could not retrieve P/E ratio.")
