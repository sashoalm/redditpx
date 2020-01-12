<script>
import Display from '../../components/Display.svelte'

import { stores } from "@sapper/app";

const { page } = stores();
const { slug } = $page.params;

let slugstr = `r/${slug}`

</script>

<style lang="sass">
</style>

<template lang="pug">
  Display({slugstr}, params ='{$page.query}')
</template>
