<template>
    <div class="grid p-component">
        <div class="col-fixe " style="width: 14rem;">
            <Navigation />
        </div>
        <div class="col col-right">
            <slot />
        </div>
    </div>
</template>

<style>
.col-right {
    margin-left: 14rem;
}
</style>
