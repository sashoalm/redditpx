<script context="module">
  export async function preload({ path, params, query }) {
    if (typeof window === "undefined") return;

    let slugstr = path.substring(1).replace(/\/$/, "").replace(/%20/g, ""); // remove the leading and trailing slash, and %20 (spaces)
    fetch("https://redditpx.jeffjose.cloud/" + slugstr).catch((e) => e);
    console.log(slugstr);

    let _slugstrL, slugstrL;
    let _slugstrR, slugstrR;

    [_slugstrL, _slugstrR] = slugstr.replace(/m\//, "").split("+");

    slugstrL = `r/${_slugstrL}`;
    slugstrR = `r/${_slugstrR}`;

    let {
      posts: postsL,
      res: resL,
      after: afterL
    } = await get_posts(`https://reddit.com/${slugstrL}.json?${queryp(query)}`);

    let {
      posts: postsR,
      res: resR,
      after: afterR
    } = await get_posts(
      `https://reddit.com/${slugstrR}.json?${queryp(query)}`
    );

    return { postsL, afterL, resL, slugstrL, postsR, afterR, resR, slugstrR };
  }
</script>

<script>
  import FullscreenLiteLayout from "../../../components/FullscreenLiteLayout.svelte";

  import { get_posts, queryp } from "../../../_utils.ts";

  import { stores } from "@sapper/app";
  const { page } = stores();

  import { favorite, layout } from "../../../_prefs";
  favorite.useLocalStorage({});
  layout.useLocalStorage(0);

  export let postsL = [];
  export let resL;
  export let afterL;
  export let slugstrL;

  export let postsR = [];
  export let resR;
  export let afterR;
  export let slugstrR;
</script>

<template lang="pug">
  +if('$layout == 0')
    .uberwrapper
      FullscreenLiteLayout(slugstr='{slugstrL}', posts='{postsL}', res='{resL}', after='{afterL}', params ='{$page.query}')
      FullscreenLiteLayout(slugstr='{slugstrR}', posts='{postsR}', res='{resR}', after='{afterR}', params ='{$page.query}')
</template>

<style>
  .uberwrapper {
    display: flex;
  }
</style>
