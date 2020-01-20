<script context="module">
export async function preload({ path, params, query }) {
  if (typeof window === "undefined") return;

  let slugstr = "";

  let { posts, res, after } = await get_posts(
    `https://reddit.com/${slugstr}.json?${queryp(query)}`
  );

  return { posts, after, res, slugstr };
}
</script>
<script>
import Display from "../components/Display.svelte";

import { get_posts, queryp } from "../_utils";

import { stores } from "@sapper/app";
const { page } = stores();

import { favorite } from "../_prefs";
favorite.useLocalStorage({});

export let posts = [];
export let res;
export let after;
export let slugstr;

// Load `favorite` from localstorage
for (let p of posts) {
  p["favorite"] = !!$favorite[p.url];
}
</script>

<template lang="pug">
  Display({slugstr}, {posts}, {res}, {after}, params ='{$page.query}')
</template>
