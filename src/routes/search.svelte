<script context="module">
  export async function preload({ path, params, query }) {
    if (typeof window === "undefined") return;

    let slugstr = path.substring(1); // remove the leading slash

    let { posts, res, after } = await get_posts(
      `https://reddit.com/${slugstr}.json?${queryp(query)}`
    );

    return { posts, after, res, slugstr };
  }
</script>

<script>
  import FullscreenLayout from "../components/FullscreenLayout.svelte";

  import { get_posts, queryp } from "../_utils.ts";

  import { stores } from "@sapper/app";
  const { page } = stores();

  import { favorite, layout } from "../_prefs";
  favorite.useLocalStorage({});
  layout.useLocalStorage(0);

  export let posts = [];
  export let res;
  export let after;
  export let slugstr;

  // Load `favorite` from localstorage
  for (let p of posts) {
    p["favorite"] = !!($favorite[p.url]?.favorite);
  }
</script>

<template lang="pug">
  +if('$layout == 0')
    FullscreenLayout({slugstr}, {posts}, {res}, {after}, params ='{$page.query}')
</template>
