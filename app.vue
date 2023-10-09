<script setup>
  import { useCategoriesStore } from '~/store/categories'
  import { useTransactionsStore } from '~/store/transactions'

  const categoriesStore = useCategoriesStore()
  const transactionsStore = useTransactionsStore()

  const { getAllCategories } = categoriesStore
  const { getAllTransactions, sortYearTransactionsByCategory, getTransactionsByMonth } = transactionsStore



  onMounted(async () => {
    console.log('mounted');
    await getAllCategories();
    await getAllTransactions({
      // get current year
      year: new Date().getFullYear(),
    });

    getTransactionsByMonth();
    await sortYearTransactionsByCategory();
  });
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
