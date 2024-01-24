<script setup>
import Papa from 'papaparse'
import slugify from 'slugify'
// import category store
import { useCategoriesStore } from '~/store/categories'
// import transactions store
import { useTransactionsStore,  } from '~/store/transactions'
import { useToast } from "primevue/usetoast";

const toast = useToast()

const categoriesStore = useCategoriesStore()
const { categories } = categoriesStore

const transactionsStore = useTransactionsStore()
const { currentYearSortedTransactions, getAllTransactions } = transactionsStore


const Manuvie = {
    date: 1,
    amount: 2,
    description: 3,
}

const PCFinance = {
    date: 3,
    amount: 5,
    description: 0,
}

// add a ref for transactions list
const transactionsList = ref([])

// add a ref to check if number of parsed transactions is the same as number of transactions added to database
const transactionsAdded = ref(0)

const chartData = computed(() => {
    if (!currentYearSortedTransactions.value) return;

    // reorder currentYearSortedTransactions by month (Janvier, Février, Mars, etc.), store it in a const
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août','Septembre', 'Octobre', 'Novembre', 'Décembre']
    const sortedTransactions = []
    for (const month in currentYearSortedTransactions.value) {
        const t = currentYearSortedTransactions.value[month]
        t.month = month
        sortedTransactions.push(t)
    }
    sortedTransactions.sort((a, b) => {
        return months.indexOf(a.month) - months.indexOf(b.month)
    })

    let dataset = {
        labels: [],
        datasets: [],
    }
    let datasetOverview = {
        labels: [],
        datasets: [],
    }
    let index = 0
    let monthExpenses = []
    for (const month of sortedTransactions) {
        dataset.labels.push(month.month)
        datasetOverview.labels.push(month.month)
        console.log('datasetOverview', datasetOverview)
        let totalMonthExpenses = 0
        for(const categorie of categories.value) {
            console.log('categorie', categorie)
            if(categorie.groupe == 'Revenu') {
                // 'rgba(75, 192, 192, 1)',
                //         'rgba(255, 99, 132, 1)'
                if(index === 0) {
                    if(!month[categorie.id]) {

                        datasetOverview.datasets.push({
                            label: categorie.categoryName,
                            data: [0],
                            fill: false,
                            borderColor: 'rgba(75, 192, 192, 1)',
                        })
                    } else {
                        datasetOverview.datasets.push({
                            label: categorie.categoryName,
                            data: [parseInt(month[categorie.id].total).toFixed(2)],
                            fill: false,
                            borderColor: 'rgba(75, 192, 192, 1)',
                        })
                    }
                } else {
                    const datasetIndex = datasetOverview.datasets.findIndex((d) => d.label === categorie.categoryName)
                    if(!month[categorie.id]) {
                        datasetOverview.datasets[datasetIndex].data.push(0)
                    } else {
                        datasetOverview.datasets[datasetIndex].data.push(parseInt(month[categorie.id].total).toFixed(2))
                    }
                }
            }

            if(categorie.groupe === 'Dépense') {
                if(index === 0) {
                    if(!month[categorie.id]) {
                        dataset.datasets.push({
                            label: categorie.categoryName,
                            data: [0],
                            fill: false,
                            borderColor: categorie.color,
                        })
                    } else {
                        dataset.datasets.push({
                            label: categorie.categoryName,
                            data: [parseInt(month[categorie.id].total).toFixed(2) * -1],
                            fill: false,
                            borderColor: categorie.color,
                        })
                        totalMonthExpenses += parseInt(month[categorie.id].total).toFixed(2) * -1
                    }
                } else {
                    const datasetIndex = dataset.datasets.findIndex((d) => d.label === categorie.categoryName)
                    if(!month[categorie.id]) {
                        dataset.datasets[datasetIndex].data.push(0)
                    } else {
                        dataset.datasets[datasetIndex].data.push(parseInt(month[categorie.id].total).toFixed(2) * -1)
                        totalMonthExpenses += parseInt(month[categorie.id].total).toFixed(2) * -1
                    }
                }

                // add data to datasetOverview we will show the sum of all dépenses in the overview chart
                // if(index === 0) {
                //     // check if datasetOverview already has a dataset with label 'Dépenses'
                //     const datasetOverviewIndex = datasetOverview.datasets.findIndex((d) => d.label === 'Dépenses')
                //     if(datasetOverviewIndex === -1) {
                //         datasetOverview.datasets.push({
                //             label: 'Dépenses',
                //             fill: false,
                //             data: [],
                //             borderColor: categorie.color,
                //         })
                //         monthTotal += month[categorie.id].total.toFixed(2) * -1
                //     } 
                // }

                // monthTotal += month[categorie.id].total.toFixed(2) * -1
            }
        }
        // push totalMonthExpenses to monthExpenses
        monthExpenses.push(totalMonthExpenses.toFixed(2))
        index++     
    }

    datasetOverview.datasets.push({
        label: 'Dépenses',
        fill: false,
        data: monthExpenses,
        borderColor: 'rgba(255, 99, 132, 1)',
    })

    const d = {
        dataset,
        datasetOverview,
    }

    console.log('d', d)

    return d
})


const handleFileUpload = async (e) => {
    // parse the csv file, for each row, find the date and the amount
    // position of the date can be different depending on the bank but date format is always the same MM/DD/YYYY
    console.log('e.target',e.target)
    Papa.parse(e.target.files[0], {
        encoding: 'iso-8859-1',
        complete: async function(results) {
            const data = results.data
            // for each row
            data.forEach((row) => {
                const transaction = {};
                let bank = '';
                let unknownBank = false;
                // identify bank, if row has 6 columns, it's a PCFinance transaction
                // if row has 4 columns, it's a Manuvie transaction
                if (row.length === 6) {
                    bank = PCFinance
                } else if (row.length === 4) {
                    bank = Manuvie
                } else {
                    bank = 'unknown'
                    unknownBank = true;
                }

                // identify the date, if bank is PCFinance, it's column 4, if bank is Manuvie, it's column 2
                const date = row[bank.date]               
                const amount = row[bank.amount]

                // check if date as format MM/DD/YYYY
                const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
                const isDateValid = dateRegex.test(date);

                // check if amount is a float with 2 decimals (like 23.65 or 0.00 or -9635.52 or 0.01 or -5.55)
                const amountRegex = /^-?\d+\.\d{2}$/;
                const isAmountValid = amountRegex.test(amount);

                // add an array for ignored transactions
                const ignoredTransactionsArray = ['Paiement MBC']

                // if bank is Manuvie and row[0] has word unique, set a const to true
                const isUnique = row[0].toLowerCase().includes('unique')

                // add a const for ignored transactions, set it to true is isUnique is true or description is in ignoredTransactionsArray

                const ignoredTransactions =  ignoredTransactionsArray.includes(row[bank.description]) || isUnique 


                
                if (isDateValid && isAmountValid && !ignoredTransactions) {
                    if(unknownBank) {
                        alert('Bank not recognized')
                        return;
                    }
                    // add amount to transaction
                    transaction.amount = Number(amount)
                    // add description to transaction, if bank is PCFinance, it's column 1, if bank is Manuvie, it's column 4
                    transaction.description = row[bank.description]
                    // if bank is PCFinance, row[1] == 'PURCHASE' add '(remboursement)' to description
                    if (bank === PCFinance && row[1] === 'REFUND') {
                        transaction.description += ' (remboursement)'
                    }
                    // convert character with accent to character without accent
                    
                    // add year to transaction (from date , format is MM/DD/YYYY)
                    transaction.year = Number(date.split('/')[2])
                    // add month to transaction (from date , format is MM/DD/YYYY)
                    transaction.month = Number(date.split('/')[0])
                    // add transactionDate to transaction
                    transaction.transactionDate = date
                    // add createdAt to transaction
                    transaction.createdAt = new Date()
                    // add updatedAt to transaction
                    transaction.updatedAt = new Date()

                    // if amount is positive, categorie = income else:
                    // look into categories object to find the one that have keywords that partially match the description 
                    // if no category is found, categorie = unknow
                    if (transaction.amount > 0) {
                        transaction.categorieId = 'income'
                    } else {
                        // add a const for categories without unknown categorie
                        const categoriesWithoutUnknown = categories.value.filter((c) => c.id !== 'unknown')
                        const category = categoriesWithoutUnknown.find((c) => {
                            const keywords = c.keywords.split(',')
                            const description = transaction.description.toLowerCase();
                            return keywords.some((k) => description.includes(k))
                        })
                        if (category) {
                            transaction.categorieId = category.id
                        } else {
                            transaction.categorieId = 'unknown'
                        }
                    }


                    // build unique id with <date (without backslash)><amount><3 first letter of description>
                    const id = date.replace(/\//g, '') + amount.replace('.', '') + transaction.description.replace(/\s/g, '').substring(0, 5)
                    transaction.id = slugify(id)
                    // transaction id must be unique in the list. if transaction id already exists, add the amount to the existing transaction
                    const existingTransaction = transactionsList.value.find((t) => t.id === transaction.id)
                    if (existingTransaction) {
                        existingTransaction.amount += transaction.amount
                    } else {
                        transactionsList.value.push(transaction)
                    }
                }
            })
            const transactionsListLength = transactionsList.value.length

            // if transactionsList is not empty, add transactions to database
            // use route /transaction to add transactions to database. don't need to loop, we use createMany from prisma
            if (transactionsListLength > 0) {
                await fetch(`/create/transaction`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(transactionsList.value)
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    } else {
                        console.log('Transactions added to database')
                        transactionsAdded.value = transactionsListLength;
                        toast.add({ severity: 'info', summary: 'Success', detail: 'Transactions téléchargées', life: 3000 });
                        // remove transaction from transactions list
                        transactionsList.value = []
                    }
                }).catch(error => {
                    console.error(`Fetch error: ${error}`);
                });
            }
        }
    });
}


// add a watcher on 



</script>

<template>
    <div>
        <h1>SUIVI DÉPENSES</h1> 
        <!-- add an input to upload csv transactions list -->
        
    </div>
    
    <div class="grid">
        <div class="col">
            <Toast />
            <input type="file" id="file" accept=".csv" @change="handleFileUpload" />
        </div>
    </div>

    <div class="grid">
        <div class="col">
            <h2>Résumé</h2>
            <Card>
                <template #content v-if="chartData?.datasetOverview?.datasets.length !== 0">
                    <Chart type="line" :data="{ ...chartData?.datasetOverview }" style="max-width: 100%;" />
                </template>
            </Card>
        </div>
    </div>
    <div class="grid">
        <div class="col">
            <h2>Dépenses</h2>
            <Card>
                <template #content v-if="chartData?.dataset?.datasets.length !== 0">
                    <Chart type="line" :data="{ ...chartData?.dataset }" style="max-width: 100%;"/>
                </template>
            </Card>
        </div>
    </div>
</template>