<script setup>
    // import categories store
    import { useCategoriesStore } from '~/store/categories'
    // import transactions store
    import { useTransactionsStore } from '~/store/transactions'

    const categoriesStore = useCategoriesStore()
    const { categories, updateCategory } = categoriesStore

    const transactionsStore = useTransactionsStore()
    const { currentYearTransactionsByMonth } = transactionsStore
    
    // get route
    const route = useRoute()
    // get year from route
    const year = route.params.year
    // get month from route
    const month = route.params.month

    // add a ref for transactions list
    const transactionsList = computed(() => {
        if (!currentYearTransactionsByMonth.value) return;
        return currentYearTransactionsByMonth.value[month]
    })

    // add a ref for categories list
    const categoriesList = computed(() => categories.value)
    // add a ref for new category
    const newCategory = ref({})
    // add a ref for new keyword
    const newKeyword = ref('')
    // add a ref for showAddKeyword
    const showAddKeyword = ref(false)

    // add a ref for sorted transactions
    const sortedTransactions = ref([])

    // add const for dialog
    const showDialog = ref(false)


    // add a computed for total income
    // it will be the total amount of in sortedTransactions where category.id === 'income'
    const totalIncome = computed(() => {
        const income = sortedTransactions.value.find((t) => t.category.id === 'income')
        return income ? income.category.totalAmount : 0
    })

    // add a computed for total expenses
    // it will be the total amount of in sortedTransactions where category.id is on of this one:
    // 'groceries', 'reccurent', 'home', 'health' ,'leisure', 'transport', 'unknow'
    const totalExpenses = computed(() => {
        const expenses = sortedTransactions.value.filter((t) => ['groceries', 'reccurent', 'home', 'health' ,'leisure', 'unknow','loan'].includes(t.category.id))
        return expenses.reduce((total, expense) => total + expense.category.totalAmount, 0)
    })

    // add a ref for chart data to display total income and total expenses
    const chartData = computed(() => {
        return {

            labels: [totalIncome.value.toFixed(2) + ' $', totalExpenses.value.toFixed(2) + ' $'],
            datasets: [
                {
                    label: 'Balance',
                    data: [totalIncome.value, totalExpenses.value * -1],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 99, 132, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1,
                },
            ],
        }
    })

    // add ref for chart options
    const chartOptions = ref({
        scales: {
            y:
                {
                    ticks: {
                        beginAtZero: true,
                        display: false // hide y-axis
                    },
                },
            x:
                {
                    ticks: {
                        display: true // hide x-axis
                    }
                }
        },
        plugins: {
            legend: {
                title: {
                    display: false // hide legend
                }
            }
        }
    })

    // add a ref for chart expanse data (will be dougnut chart)
    // it will be the repartition of this categories: loan, reccurent, groceries, home, health, leisure
    const chartExpensesData = computed(() => {      
        // get all expenses. Expenses is categories with groupe == Dépense
        const expenses = sortedTransactions.value.filter((c) => c.category.groupe === 'Dépense')
        // from expenses make an array with the color of each category (Expenses is an array of categories, where each category is an object with key color )
        const borderColors = expenses.map((e) => e.category.color)
        // add const categoriesTransparentColor where each color is equal to the color of the category with 0.2 opacity
        const bgColors = expenses.map((e) => e.category.color + '33')

        return {
            labels: expenses.map((e) => e.category.name),
            datasets: [
                {
                    label: 'Dépenses',
                    data: expenses.map((e) => e.category.totalAmount),
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                },
            ],
        }
    })

    // add a ref for chart expenses options and give it a responsive size
    const chartExpensesOptions = ref({
        responsive: true,
        maintainAspectRatio: true,
        height: 300,
        width: 300,
    })

    // reset sorted transactions
    sortedTransactions.value = []

    // sort transactions by category
    // add total amount for each category
    
    const sortTransaction = () =>  {
        categories.value.forEach((category) => {
            const transactions = transactionsList.value.filter((transaction) => transaction.categorieId == category.id)
            // add total amount for each category
            category.totalAmount = transactions.reduce((total, transaction) => total + transaction.amount, 0)
            sortedTransactions.value.push({
                category: category,
                transactions: transactions
            })
            // reorganize sortedTransactions to follow this order of categorieId:
            // income, investment, loan, reccurent, groceries, home, health, leisure, unknow, blacklist
            sortedTransactions.value.sort((a, b) => {
                const categoriesOrder = ['income', 'investment', 'loan', 'reccurent', 'groceries', 'home', 'health', 'leisure', 'unknow', 'blacklist']
                return categoriesOrder.indexOf(a.category.id) - categoriesOrder.indexOf(b.category.id)
            })
        })
    }

    /* 
        Each transaction will have an action to edit category or delete the transaction
        when the action is clicked open a modal to edit category or delete the transaction
        when the modal is closed, refresh the transactions list and update the database
    */
    const transactionToEdit = ref({})

    // add method for toggleAction
    const toggleAction = (transaction) => {
        // set transactionToEdit to transaction
        transactionToEdit.value = transaction
        newKeyword.value = transaction.description
        // open modal
        showDialog.value = true

    }

    // add a method to edit the category
    const editCategory = async (values) => {
        // update transaction category
        const oldCategory = transactionToEdit.value.categorieId
        transactionToEdit.value.categorieId = newCategory.value.id
        showAddKeyword.value = true
        // update database
        await fetch(`/update/transaction`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionToEdit.value)
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                console.log('Transaction updated in database')
                // remove transaction from the old category list and add it to the new category list
                const oldCategoryTransactions = sortedTransactions.value.find((t) => t.category.id === oldCategory)
                const newCategoryTransactions = sortedTransactions.value.find((t) => t.category.id === newCategory.value.id)
                const transactionIndex = oldCategoryTransactions.transactions.findIndex((t) => t.id === transactionToEdit.value.id)
                oldCategoryTransactions.transactions.splice(transactionIndex, 1)
                newCategoryTransactions.transactions.push(transactionToEdit.value)
                // update total amount for old and new category
                oldCategoryTransactions.category.totalAmount -= transactionToEdit.value.amount
                newCategoryTransactions.category.totalAmount += transactionToEdit.value.amount
            }
        }).catch(error => {
            console.error(`Fetch error: ${error}`);
        });
    }

    /* addKeyword method
        add a new keyword to the category
        update database
    */
    const addNewKeyword = async () => {
        // add new keyword to category
        const category = categoriesList.value.find((c) => c.id === newCategory.value.id)
        // add a let to copy category
        let copyCategory = {...category}
        // remove key totalAmount
        delete copyCategory.totalAmount
        // lowercase newKeyword
        newKeyword.value = newKeyword.value.toLowerCase()
        copyCategory.keywords += `,${newKeyword.value}`
        // update database
        await updateCategory(copyCategory)
        // close modal
        showDialog.value = false
        // reset newKeyword
        newKeyword.value = ''
        // reset newCategory
        newCategory.value = {}
        // reset showAddKeyword
        showAddKeyword.value = false
    }

    // before mount get transactions
    onMounted(async () => {
        sortTransaction()
    })
    
</script>
<template>
    <Dialog v-model:visible="showDialog" modal header="Modifier la transaction" :style="{ width: '50vw' }">
        <div class="flex gap-2 mb-2">
            <div class="font-bold text-green-200">{{ globalCategories()[transactionToEdit.categorieId] }} &nbsp;- </div>
            <div>{{ transactionToEdit.description }}</div>
            <div>{{ transactionToEdit.amount.toFixed(2) }} $</div>
        </div>
        <div>
            <form @submit.prevent="editCategory" class="mb-4">
                <div class="flex gap-2">
                    <Dropdown v-model="newCategory" :options="categoriesList" optionLabel="name" placeholder="modifier la catégorie" class="w-full md:w-16rem" />
                    <Button type="submit" label="modifier" class="p-button-success" />
                </div>
            </form>
            <form @submit.prevent="addNewKeyword" class="mb-4" v-if="showAddKeyword">
                    <label for="keyword">Ajouter un nouveau mot clé à la catégorie <span class="font-bold">{{ globalCategories()[newCategory.id] }}</span></label>
                    
                    <div class="flex gap-2 mt-2">
                        <InputText id="keyword" v-model="newKeyword" />
                        <Button type="submit" label="ajouter" class="p-button-success" />
                        <Button label="Non" class="p-button-danger" @click="() => {showDialog = false; newCategory = {}; showAddKeyword = false}" />
                    </div>
            </form>
        </div>

    </Dialog>

    <div class="grid">
        <div class="col">
            <h1>Transactions de {{ month }} {{ year }}</h1>
        </div>
    </div>
    <div class="grid mb-2">
        <div class="col-8">
            <Card>
                <template #content>
                    <div class="flex flex-column gap-2">
                        <div class="text-500 text-xs">Revenus: {{ totalIncome.toFixed(2) }} $</div>
                        <div class="text-500 text-xs">Dépenses: {{ totalExpenses.toFixed(2) }} $</div>
                        <div 
                            class="font-bold text-xl text-green-300"
                            :class="{'text-red-400': (totalIncome + totalExpenses) < 0}"
                        >
                            Balance: {{ (totalIncome + totalExpenses).toFixed(2) }} $
                        </div>
                    </div>
                    <Chart :type="'bar'" :data="chartData" :options="chartOptions"/>
                </template>
            </Card>
        </div>
        <div class="col-4">
            <Card>
                <template #content>
                    <Chart :type="'doughnut'" :data="chartExpensesData" :options="chartExpensesOptions"/>
                </template>
            </Card>
        </div> 
    </div>
    <!-- display sorted transaction with category.name as title and the list of transactions -->
    <div class="grid">

        <div v-for="sortedTransaction in sortedTransactions" :key="sortedTransaction.category.id"
            class="col-6"
        >
                <Card>
                    <template #content>
                        <DataTable 
                            :value="sortedTransaction.transactions"
                            scrollable 
                            scrollHeight="40rem"
                            tableStyle="min-width:16rem">
                            <template #header>
                               <h2 class="flex justify-content-between gap-2">
                                <span>{{ sortedTransaction.category.name }}</span>
                                <span>{{ sortedTransaction.category.totalAmount.toFixed(2) }}&nbsp;$</span>
                                </h2> 
                            </template>
                            <!-- column for date -->
                            <Column field="transactionDate" header="date"></Column>
                            <Column field="description" header="Description"></Column>
                            <Column field="amount" header="Amount" class="text-right">
                                <template #body="slotProps">
                                    {{ slotProps.data.amount.toFixed(2) }}&nbsp;$
                                </template>
                            </Column>
                            <Column field="id" header="Actions" class="text-center">
                                <template #body="slotProps">
                                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-danger p-button-text" @click="toggleAction(slotProps.data)"></Button>
                                </template>
                            </Column>
                        </DataTable>
                    </template> 
                </Card>
        </div>
    </div>
</template>