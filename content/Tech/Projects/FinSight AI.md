("Finance + Insight + AI")

> An AI-driven app that lets users track stock portfolios, view news-based sentiment analysis, and receive natural language insights on their investments.


# Goals
1. Production ready backend with FastAPI
2. Integrate real time financial data (stock prices, news)
3. Use AI for NLP tasks: sentiment analysis, news summarization, NLP queries
4. Dockerized deployment
5. Create a streamlit frontend

# Architecture Overview
```sql                  +------------------------+
                    |   Frontend (Streamlit) |
                    +-----------+------------+
                                |
                                ▼
                    +-----------+-----------+
                    |     FastAPI Backend    |
                    |  (Modular: Users, News,|
                    |   Portfolio, AI APIs)  |
                    +-----------+-----------+
                                |
        +-----------+-----------+------------+------------+
        |            |                        |           |
        ▼            ▼                        ▼           ▼
  PostgreSQL   Yahoo Finance API       News API     OpenAI API
 (Users, Hold-  (Stock Prices)        (News Data)   (LLM Tasks)
 ings, News,
 Sentiment)

```

# Workflow
1. User & Portfolio Management
	* Uses PostgreSQL with SQLAlchemy ORM
	* Tracks: ticker, quantity, buy price, timestamps

2. Stock Price Fetcher
	* Uses yfinance or polygon.io
	* Real-time price updates for holdings
	* Daily summaries like total portfolio gain/loss

3. News + Sentiment Analyzer Dashboard
	* News API (e.g. NewsAPI, Finviz, Bing News, or scraping)
	* Store news articles by ticker in DB
	* Sentiment: Use VADER (for quick), or FinBERT / OpenAI for contextual NLP
	* Summarizer: GPT-3.5 or OpenAI API to summarize headlines

4. AI Query Interface
	* Retrieve portfolio data
	* Fetch related news + sentiments
	* Respond via OpenAI

# Project Build-Up

1. **Creation of Database and tables required for the project**
	Tables used:
	* users (Stores the user's Name, Email and password)
	* holdings (Stores the user stock holdings)
	* stocks (Table with all stock listings) (Used the following )
```bash
 \copy stocks(stock_symbol, stock_name, sector) FROM '/Users/elam/Work/Projects/FastAPI/FinSight-AI/stock_symbols.csv' DELIMITER ',' CSV HEADER;
```

2. **Create FastAPI API endpoints to interact with the database and perform CRUD operations**
	* `signup` - Users enter their name, email and password (These details will get stored in the `users` table) to sign up. Password will be hashed before getting stored into the db
	* `login` - Users enter their email and password to login. Upon login, the `JWT Bearer Token` will be generated which has to be used for further API endpoint accessing
	* `me` - Returns the `id` of the current logged in user
	* `add-holding` - Used to add a new holding to an user's portfolio
	* `get-all-holdings` - Used to get the cumulative list of all holdings for an user
	* `get-holdings-by-symbol` - Used to get the holdings list for an user for a particular stock
