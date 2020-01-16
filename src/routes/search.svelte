<script context="module">
	export async function preload({ path, params, query }) {
    console.log('preload-before', params.slug)

    if (typeof window === 'undefined') return

    let slugstr = path.substring(1,) // remove the leading slash

    let { posts, after } = await get_posts(
      `https://reddit.com/${slugstr}.json?${queryp(query)}`
    );

    return {posts: posts, after: after, slugstr: slugstr}

  }
</script>
<script>
import Display from '../components/Display.svelte'

import { stores } from "@sapper/app";
import { onMount, beforeUpdate, afterUpdate} from "svelte";

import { get_posts, queryp } from "../_utils";

const { page } = stores();
const { slug } = $page.params;

import { selected } from "../_prefs";
selected.useLocalStorage({});

export let posts = []
export let after
export let slugstr

beforeUpdate(async () => {
  console.log('[slug]: beforeUpdate')
  })

afterUpdate(async () => {
  console.log('[slug]: afterUpdate')
  })

onMount(async () => {

  // Load `selected` from localstorage
  for (let post of posts) {
    post["selected"] = !!$selected[post.url];
  }


});
</script>

<template lang="pug">
  Display({slugstr}, {posts}, {after}, params ='{$page.query}')
</template>
