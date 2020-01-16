<script>
import Display from '../components/Display.svelte'

import { stores } from "@sapper/app";
import { onMount} from "svelte";

import { get_posts, query_params } from "../_utils";

const { page } = stores();
const { slug } = $page.params;

import { selected } from "../_prefs";
selected.useLocalStorage({});

let slugstr = ``

let posts = []
let after

onMount(async () => {

  ({ posts, after } = await get_posts(
    `https://reddit.com/${slugstr}.json?${query_params($page.query)}`
  ));
  // Load `selected` from localstorage
  for (let p of posts) {
    p["selected"] = !!$selected[p.url];
  }


});
</script>

<template lang="pug">
  Display({slugstr}, {posts}, {after}, params ='{$page.query}')
</template>
