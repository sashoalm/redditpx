<script context="module">
import { goto as ahref } from "@sapper/app";
export async function preload({ path, params, query }) {
  if (typeof window === "undefined") return;

  let slugstr = path.substring(1).replace(/\/$/, ''); // remove the leading and trailing slash

  let { posts, after } = await get_posts(
    `https://reddit.com/${slugstr}.json?${queryp(query)}`
  );

  if (posts.length) {
    ahref(`/${posts[0].subredditp}`)
  }


  return { posts: posts, after: after, slugstr: slugstr };
}
</script>
<script>
import Display from "../../components/Display.svelte";

import { stores } from "@sapper/app";
import { onMount, beforeUpdate, afterUpdate } from "svelte";

import { get_posts, queryp } from "../../_utils";

const { page } = stores();
const { slug } = $page.params;

import { favorite } from "../../_prefs";
favorite.useLocalStorage({});

export let posts = [];
export let after;
export let slugstr;

// Load `favorite` from localstorage
for (let p of posts) {
  p["favorite"] = !!$favorite[p.url];
}

</script>

<template lang="pug">
  Display({slugstr}, {posts}, {after}, params ='{$page.query}')
</template>
