// store for the transactions
// it will be used to get the transactions from the server
// a method will get all the transactions from a specific year
// a method will update a transaction


export const useTransactionsStore = defineStore('transactions', () => {
        const currentYearTransactions = reactive({});
        const currentYearTransactionsByMonth = reactive({});
        const currentYearSortedTransactions = reactive({});
    
        async function getAllTransactions (params) {
            currentYearTransactions.value =  await fetch('api/read/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...params
                }),
            })
            .then(response => response.json())
            .then(data => data)
            .catch(error => {
                console.error(`Fetch error: ${error}`);
            });
        }
    
        async function updateTransaction (transaction) {
            // edit transaction
            await fetch(`api/update/transaction`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transaction)
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                } else {
                    console.log('Transaction updated in database')
                }
            }).catch(error => {
                console.error(`Fetch error: ${error}`);
            });
        }

        function getTransactionsByMonth () {
            let sortedTransactions = {}
            for (const transaction of currentYearTransactions.value) {
                const month = globalMonths()[transaction.month];
                //check if currentYearTransactionsByMonth already has a key with the month
                if (sortedTransactions[month]) {
                    sortedTransactions[month].push(transaction);
                } else {
                    sortedTransactions[month] = [transaction];
                }
            }
            currentYearTransactionsByMonth.value = sortedTransactions;
        }

        /**
         * Sort the transactions by category
         * create an object per month.
         * for each month, create an object per category.
         * for each category, add the transactions to the category object
         * for each category object, add the total amount of the transactions
         */
        async function sortYearTransactionsByCategory () {
            let sortedTransactions = {}
            const categories = await fetch(`api/read/category`)
            .then(response => response.json())
            .then(data => data)
            .catch(error => {
                console.error(`Fetch error: ${error}`);
            });
            console.log('categories',categories)

            for (const month in currentYearTransactionsByMonth.value) {
                sortedTransactions[month] = {};
                for (const transaction of currentYearTransactionsByMonth.value[month]) {
                    //console.log(transaction)
                    //check if currentYearTransactionsByMonth already has a key with the month
                    if (sortedTransactions[month][transaction.categorieId]) {
                        // add the transaction to the transactions array
                        sortedTransactions[month][transaction.categorieId].transactions.push(transaction);
                        // add the amount to the total
                        sortedTransactions[month][transaction.categorieId].total += transaction.amount;
                    } else {
                        // set a new object with the category id as key
                        sortedTransactions[month][transaction.categorieId] = {
                            transactions: [transaction],
                            total: transaction.amount,
                            // find the group of the category. Categories is a array of objects. get the value of key 'groupe' of the object with the id of the category
                            group: categories.find(category => category.id === transaction.categorieId).groupe
                        };
                        

                    }

                }

            }
            currentYearSortedTransactions.value = sortedTransactions;

        }
    
        return {
            currentYearTransactions,
            currentYearTransactionsByMonth,
            getAllTransactions,
            updateTransaction,
            getTransactionsByMonth,
            currentYearSortedTransactions,
            sortYearTransactionsByCategory
        }
    });