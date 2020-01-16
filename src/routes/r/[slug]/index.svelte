<script context="module">
	export async function preload({ path, params, query }) {
    console.log('preload-before', params.slug)

    if (typeof window === 'undefined') return
    let slugstr = path.substring(1,) // remove the leading slash

    let { posts, after } = await get_posts(
      `https://reddit.com/${slugstr}.json?${query_params(query)}`
    );

    return {posts: posts, after: after}

  }
</script>
<script>
import Display from '../../../components/Display.svelte'

import { stores } from "@sapper/app";
import { onMount, beforeUpdate, afterUpdate} from "svelte";

import { get_posts, query_params } from "../../../_utils";

const { page } = stores();
const { slug } = $page.params;

import { selected } from "../../../_prefs";
selected.useLocalStorage({});

$ : slugstr = $page.path.substring(1,) // remove the leading slash

export let posts = []
export let after

beforeUpdate(async () => {
  console.log('[slug]: beforeUpdate')
  })

afterUpdate(async () => {
  console.log('[slug]: afterUpdate')
  })

onMount(async () => {

  // Load `selected` from localstorage
  for (let p of posts) {
    p["selected"] = !!$selected[p.url];
  }


});
</script>

<template lang="pug">
  Display({slugstr}, {posts}, {after}, params ='{$page.query}')
</template>
