<script setup>
    // import transactions store
    import { useTransactionsStore } from '~/store/transactions'

    const transactionsStore = useTransactionsStore()
    const { currentYearTransactionsByMonth, getTransactionsByMonth } = transactionsStore
    // a ref for the navigation menu
    const navigationMenu = ref(false)

    // get current year
    const currentYear = new Date().getFullYear()

    // add a computed for existing months, set to keys of currentYearTransactionsByMonth
    const existingMonths = computed(() => {
        if (!currentYearTransactionsByMonth.value) return;
        
        return Object.keys(currentYearTransactionsByMonth.value)
    })

    const monthMenu = computed(() => {
        if (!existingMonths.value) return;
        return existingMonths.value.map((month) => {
            return {
                label: month,
                to: `/year-${currentYear}/${month}`,
            }
        })
    })

    

</script>
<template>
    <!-- for each month in existing months add a nuxtLink to /currentYear/month -->
        <Menu :model="monthMenu" class="min-h-screen fixed">
            <template #start>
                <h1 class="w-full pb-2 pl-3">{{ currentYear }}</h1>
                <NuxtLink to="/" class="w-full p-link flex align-items-center  p-3  text-color hover:surface-200 border-noround no-underline">
                    <div class="flex align-center gap-2">
                        <i class="pi pi-wallet"></i>
                        <!-- add Nuxtink to home -->
                        <span class="text-color font-bold" style="text-decoration: none">Accueil</span>
                    </div>
                </NuxtLink>
            </template>
        </Menu>

</template>