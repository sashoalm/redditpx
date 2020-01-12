<script>
import Display from '../../../components/Display.svelte'

import { stores } from "@sapper/app";

const { page } = stores();
const { slug } = $page.params;

let slugstr = $page.path.substring(1,) // remove the leading slash

</script>

<style lang="sass">
</style>

<template lang="pug">
  Display({slugstr}, params ='{$page.query}')
</template>
