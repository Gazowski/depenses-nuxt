this is a web app to overview personal finance.
 ## TODO
- [ ] add a color for categories (DB)
- [ ] add a type for categories (DB)
- [ ] add a button to delete all transactions

## Features
- [ ] upload csv file
- [ ] sort transactions by category and year and month
- [ ] show transactions by category and year and month
- [ ] show transactions by category and year and month in a pie chart
- [ ] show evolution of budget

## stack
- nuxt 3
- local sql database (with wampserver)
- prisma
- primevue

## overview
user can upload a csv file with transactions. the app will parse the file and store the transactions in a local sql database. the user can then sort the transactions by category and year and month. the user can also see the transactions by category and year and month in a pie chart. the user can also see the evolution of the budget in a line chart.

## categories
- income
- investment
- groceries
- recurrent
- health
- home
- leisure
- unknown