<script>
import Icon from "fa-svelte";
import { faPlay } from "@fortawesome/free-solid-svg-icons/faPlay";
import { faPause } from "@fortawesome/free-solid-svg-icons/faPause";
import { faCog as faSettings } from "@fortawesome/free-solid-svg-icons/faCog";
import { faCloudDownloadAlt as faDownload } from "@fortawesome/free-solid-svg-icons/faCloudDownloadAlt";
import { faStar as faFav } from "@fortawesome/free-solid-svg-icons/faStar";
import { faStar as faUnFav } from "@fortawesome/free-regular-svg-icons/faStar";
import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";

import { onMount, tick } from "svelte";
import { stores } from "@sapper/app";

import { get_posts} from "../_utils";

import { autoplay, selected, over18 } from "../_prefs";
autoplay.useLocalStorage(true)
selected.useLocalStorage({})
over18.useLocalStorage(true)

const { page } = stores();
const { slug } = $page.params;


let data;
let posts = [];
let displayposts = [];
let res;
let after;
let uiVisible = true;
let numSelected = 0;

let downloadstr = "";
let autoplaystr = "";
let over18str = "";

let autoplayinterval = 3;
let autoplaytimer;

let filterRef;
let filterExpanded = false;
let filterValue = "";

let currpost = { title: "Loading .." };
let nexturls = [];

let index = 0;

let errorinputValue = slug;

async function loadMore() {
  if (!after) return;

  let newposts;

  ({ posts: newposts, after, ...res } = await get_posts(
    `https://reddit.com/r/${slug}.json?after=${after}`
  ));

  for(const p of posts) {
    p.selected = $selected[p.url]
  }


  posts = [...posts, ...newposts];
}

onMount(async () => {
  ({ posts, after, ...res } = await get_posts(
    `https://reddit.com/r/${slug}.json`
  ));

  for(const p of posts) {
    p.selected = $selected[p.url]
  }

  console.log("start of the app", $autoplay)
  // Start autoplay by default
  if ($autoplay) {
    console.log('autoplay by default', $autoplay)
    startAutoPlay();
  }
});

function startAutoPlay() {
  //console.log('START')
  autoplaytimer = setInterval(() => {
    // If `autoplay` is off and it is a video, the video will progress by itself via on:ended
    if ($autoplay && currpost.is_image) {
      //console.log('---- iNEXT')
      next();
    } else if (!$autoplay && currpost.is_video) {
      //console.log('---- vNEXT')
      next();
    }
  }, autoplayinterval * 1000);

  autoplay.set(true)
}

function stopAutoPlay() {
  //console.log('STOP')
  clearInterval(autoplaytimer);
  autoplay.set(false)
}

function stopAndStartAutoPlay() {
  stopAutoPlay();

  startAutoPlay();
}

function toggleAutoPlay() {
  if ($autoplay) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
}

let renderVideo = true;

// Some operations like fav/unfav causes video to re-render
// since we're changing post.selected. This should help skip it
let skipRenderVideo = false;

$: {
  if (!skipRenderVideo) reMountVideo(currpost.preview);
  skipRenderVideo = false;
}

function reMountVideo() {
  renderVideo = false;
  setTimeout(() => (renderVideo = true), 0);
}

$: {
  numSelected = displayposts.filter(item => item.selected == true).length;

  if (!numSelected) {
    downloadstr = `nothing to download`;
  } else if (numSelected == 1) {
    downloadstr = `download ${numSelected} file`;
  } else {
    downloadstr = `download ${numSelected} files`;
  }
  autoplaystr = `autoplay is ${$autoplay ? "on" : "off"}`;
  over18str = `nsfw is ${$over18 ? "on" : "off"}`;
}

$: {
  if (displayposts[index]) {
    currpost = JSON.parse(JSON.stringify(displayposts[index]));

    nexturls = displayposts.slice(index + 1, index + 4);
  } else if (filterValue) {
    // We're here because user filtered the list

    // Unfortunately the filtered list is smaller than the current index
    // set index to last item
    if (displayposts.length > 0) {
      console.log("setting index from ", index, " to ", displayposts.length);
      index = displayposts.length - 1;
      console.log("loading more ..");
      loadMore();
    } else {
      // nothing was filtered
      index = 0;
      currpost = { title: "Nothing to show" };
    }
  } else {
    if (res && res.res.ok) {
      // No media found
      currpost = { title: "Nothing to show" };
    } else if (res && !res.res.ok) {
      // Invalid subreddit
      currpost = { title: "Error" };
    } else {
      // Default
      currpost = { title: "Loading .." };
    }

    nexturls = [];
  }
}

$: {
  let tmp = [];

  if (!$over18) {
    tmp = posts.filter(item => item.over18 == false);
  } else {
    tmp = posts;
  }

  if (filterValue) {
    skipRenderVideo = true;
    tmp = tmp.filter(item => item.title.toLowerCase().includes(filterValue));
  }

  displayposts = tmp;
}

function goto(i) {
  index = i;

  if (displayposts.length - index === 1) {
    loadMore();
  }

  if ($autoplay) stopAndStartAutoPlay();
}

function videoended() {
  next();
}

function next() {


  // Last item, dont go past the last item
  if (displayposts.length - index == 1) {
    index = displayposts.length - 1;

    console.log("[lastitem, autoplay+filter?]: loading more ..");
    // Reached last item, possibly by autoplay + filter
    loadMore();
    return;
  }

  index += 1;

  // Auto trigger on the last 3rd item
  if (displayposts.length - index === 3) {
    console.log("[3rd last item, normal]: loading more ..");
    loadMore();
  }

  // If we're at 2nd last item with a filter, the user
  // possibly just filtered the list and ended up here.
  // trigger a load more. We dont want to do it always since
  // we normally trigger loadmore @3rd last item. Always doing it
  // Would end up with 2 requests to reddit.com
  if (displayposts.length - index === 2 && filterValue) {
    console.log("[2nd last item, filtering?]: loading more ..");
    loadMore();
  }

  if ($autoplay) stopAndStartAutoPlay();
}

function prev() {
  if (index === 0) return;
  index -= 1;

  if (displayposts.length - index === 3) {
    loadMore();
  }
  if ($autoplay) stopAndStartAutoPlay();
}

function toggleUIVisiblity() {
  uiVisible = !uiVisible;
}

async function expandFilter() {
  filterExpanded = true;

  await tick();
  // Focus the input if we just opened it
  if (filterExpanded) filterRef.querySelector("input").focus();
}

async function toggleFilter() {
  filterExpanded = !filterExpanded;

  await tick();
  // Focus the input if we just opened it
  if (filterExpanded) filterRef.querySelector("input").focus();
}

async function downloadFiles() {
  //let res = await fetch('/download')
  //let pagehtml = await res.text()

  let win = window.open("", "title");

  for (const [i, post] of displayposts.entries()) {
    if (post.selected) {
      //pagehtml += `<img src="${post.url}" />`

      // We need displayposts[i].selected here to make this change reactive
      displayposts[i].selected = false;
    }
  }

  //console.log(win.document.body, pagehtml)
  win.document.body.innerHTML =
    '<img src="https://i.redd.it/hjt5at4l2f941.jpg" />';
}

function openMedia() {
  window.open(currpost.url, "_blank");
}

function openSubReddit() {
  window.open(`https://reddit.com/${currpost.permalink}`, "_blank");
}

function openSubRedditOld() {
  window.open(`https://old.reddit.com/${currpost.permalink}`, "_blank");
}

function toggleOver18() {
  skipRenderVideo = true;
  over18.set(!$over18)
}

function toggleSelected() {
  skipRenderVideo = true;
  displayposts[index].selected = !displayposts[index].selected;

  let url = displayposts[index].url
  if (displayposts[index].selected) {
    // Set into localStorage
    $selected[url] = true
    selected.set($selected)
  }else {
    // setting a value in javascript which after JSON.parse(JSON.stringify(d)) removes it

    $selected[url] = undefined

    selected.set($selected)
    //selected.set({1:1})
  }


}

function keydown(event) {
  console.log(event.keyCode);

  // slash
  if (event.keyCode == 191) {
    expandFilter();
    // We need this, otherwise filter box will have '/' because of autofocus
    console.log("preventDefault");
    event.preventDefault();
  }

  // x
  if (event.keyCode == 88) {
    toggleSelected();
  }

  if (event.ctrlKey) {
    return;
  }

  // r
  if (event.keyCode == 82) {
    openSubReddit();
  }

  // o
  if (event.keyCode == 79) {
    openSubRedditOld();
  }

  // i
  if (event.keyCode == 73) {
    openMedia();
  }

  // Up Arrow
  if (event.keyCode == 38) {
    toggleUIVisiblity();
  }

  // Left Arrow, a, k
  if (event.keyCode == 37 || event.keyCode == 65 || event.keyCode == 75) {
    prev();
  }
  // Right Arrow, d, j, Space
  else if (
    event.keyCode == 39 ||
    event.keyCode == 68 ||
    event.keyCode == 74 ||
    event.keyCode == 32
  ) {
    next();
  }
}
</script>

<style lang="sass">
$yellow: #f9ab00

$text-color: #fafafa
$accent-color: white
$selected-color: #fbbc04
$selected-border-color: #e37400
$over18-color: #ea4335
$over18-border-color: #ea4335

.hide
  display: none !important

.wrapper
  height: 100vh

  display: grid
  justify-items: center
  align-items: center

  .hero
    height: 100vh
    width: 100%

    grid-template-columns: auto
    display: grid
    justify-items: center
    align-items: center

    .error
      z-index: 10

    .settings
      z-index: 10
      position: absolute
      top: 0
      right: 0
      color: $text-color
      font-size: 1rem
      padding: 1.5rem

    .title
      z-index: 10
      position: absolute
      top: 0
      background-color: rgba(0, 0, 0, 0.4)
      color: $text-color
      font-size: 1.5rem
      max-width: 500px
      padding: 1rem
      border-radius: 3px

      .fav
        user-select: none
        cursor: pointer
        top: 2px
        position: relative
        margin-right: 12px

        &:hover
          color: $selected-color

      &.selected
        color: $selected-color

    .goto
      user-select: none
      z-index: 5
      position: absolute
      background-color: rgba(0, 0, 0, 0.6)
      bottom: 0
      display: grid
      grid-row-gap: 5px
      padding: 1rem 11rem
      border-radius: 3px
      color: $text-color
      width: 100%
      grid-template-columns: repeat(auto-fill, minmax(32px, 1fr))

      .btn
        text-align: center
        padding-top: 2px
        color: rgba(white, 30%)

        &.over18wrapper

          cursor: pointer
          grid-column: span 2
          justify-self: center

          &.over18

            p
              border: 1px solid rgba(white, 30%)
              color: rgba(white, 30%)

              &:hover
                border: 1px solid rgba(white, 60%)
                color: rgba(white, 60%)

          p
            font-size: 0.9rem
            border: 1px solid $over18-color
            border-radius: 3px
            color: $over18-color
            margin: 0
            //margin-right: 13px
            width: 35px
            font-family: "Roboto Condensed", sans-serif
            position: relative
            top: -1px

        &.download
          cursor: default
          font-size: 1.4rem
          bottom: 2px

          &.dlready
            color: rgba($selected-color, 90%)
            cursor: pointer

            &:hover
              color: $yellow

        &.playpause
          cursor: pointer
          top: 1px

          // When it is play icon, make it white
          &.play
            color: white

          &:hover
            color: white

        &.filter
          cursor: pointer
          top: 1px

          &:hover
            color: white

          &.filter.filterExpanded
            grid-column: span 3
            top: -2px

            input
              width: 90%
              margin-left: 9px
              padding-left: 5px
              padding-right: 5px
              border: 1px solid rgba(white, 60%)
              background-color: rgba(0, 0, 0, 0)
              color: white

      span
        position: relative

        &.selected

          p.small
            //background-color: $selected-color
            border-bottom: 3px solid $selected-border-color !important
            color: $selected-color

          img.small
            border-color: $selected-border-color !important

        &.over18

          p.small
            color: $over18-color
            //background-color: $over18-color
            border-bottom: 3px dashed $over18-border-color

          img.small
            border-color: $over18-border-color

        p.small
          margin: 0 2px
          text-align: center
          cursor: pointer
          border-bottom: 3px solid rgba(0, 0, 0, 0)

          &.curr
            background-color: rgba(255, 255, 255, 0.2)
            border-bottom: 3px solid $accent-color !important

        img.small
          z-index: 10
          width: 0px
          height: 0px
          opacity: 0
          position: absolute
          bottom: 35px
          border: 2px solid white
          background-color: lighten(black, 30%)
          min-width: 100px
          pointer-events: none

        &:hover p.small
          background-color: rgba(255, 255, 255, 0.1)
          border-bottom: 3px solid $accent-color !important

        &:hover img
          width: auto
          height: 100px
          opacity: 1

    .control
      position: absolute
      height: 100%
      z-index: 5

      &.prev
        left: 0
        width: 10%
        //background-color: rgba(255, 138, 138, 0.38)

        &:hover
          background-color: rgba(255, 255, 255, 0.1)

      &.next
        right: 0
        width: 90%
        //background-color: rgba(138, 255, 233, 0.38)

    .image
      height: 100%
      width: 100%
      background-size: contain
      background-repeat: no-repeat
      background-position: center

    .video
      height: 100%
      width: 100%

  .prefetch
    display: none

  @media (max-width: 1000px)
    .hero
      .goto
        padding: 1rem 11rem 1rem 1rem

  @media (max-width: 800px)
    .hero
      .goto
        padding: 1rem

        img.small
          display: none

.tooltip
  position: relative
  z-index: 2
  cursor: pointer

.tooltip
  &:before, &:after
    visibility: hidden
    opacity: 0
    pointer-events: none

  &:before
    position: absolute
    bottom: 120%
    left: 50%
    margin-bottom: 5px
    margin-left: -30px
    padding: 5px 4px
    width: 60px
    border-radius: 3px
    background-color: #000
    background-color: hsla(0, 0%, 20%, 0.9)
    color: #fff
    content: attr(data-tooltip)
    text-align: center
    font-size: 0.8rem
    line-height: 1.2

  &:after
    position: absolute
    bottom: 120%
    left: 50%
    margin-left: -5px
    width: 0
    border-top: 5px solid #000
    border-top: 5px solid hsla(0, 0%, 20%, 0.9)
    border-right: 5px solid transparent
    border-left: 5px solid transparent
    content: " "
    font-size: 0
    line-height: 0

  &:hover
    &:before, &:after
      visibility: visible
      opacity: 1
</style>

<svelte:window on:keydown={keydown}/>

<template lang="pug">
.wrapper
  .hero
    +if('res && !res.res.ok')
      .error
        input(bind:value='{errorinputValue}', on:keydown|stopPropagation)
        a(href="{'/r/' + errorinputValue}") click
        a(href="/r/gifs") gifs
    .control.prev(on:click="{prev}")
    .title(class:hide="{uiVisible == false}", class:selected="{currpost.selected}")
      +if('displayposts.length')
        span.fav(on:click|stopPropagation|preventDefault="{function(){toggleSelected()}}")
          Icon(icon="{currpost.selected ? faFav : faUnFav}")
      | {currpost.title}
    .settings(class:hide="{uiVisible == false}")
      Icon(icon="{faSettings}")
    +if('currpost.is_image')
      .image(style="background-image: url('{currpost.preview.img.default}')")
      +elseif('currpost.is_video && renderVideo')
        video.video(autoplay, loop='{!$autoplay}', playsinline, muted, on:ended="{videoended}")
          +if('currpost.preview.vid.webm')
            source(src="{currpost.preview.vid.webm}")
          +if('currpost.preview.vid.mp4')
            source(src="{currpost.preview.vid.mp4}")
          //img(alt="foo", src='{currpost.preview.vid.gif}')

    .control.next(on:click="{next}")
    +if('displayposts.length || filterValue')
      .goto(class:hide="{uiVisible == false}")
        span.btn.playpause.tooltip(
          data-tooltip="{autoplaystr}",
          class:play="{$autoplay}",
          on:click="{function(){toggleAutoPlay()}}"
        )
          Icon(icon="{$autoplay ? faPause : faPlay}")
        span.btn.download.tooltip(
          on:click="{function(){downloadFiles()}}",
          data-tooltip="{downloadstr}",
          class:dlready="{numSelected}"
        )
          Icon(icon="{faDownload}")
        span.btn.filter.tooltip(
          class:filterExpanded="{filterExpanded}",
          on:click="{function(){toggleFilter()}}",
          data-tooltip="Filter ( / )",
          bind:this='{filterRef}'
          class:dlready="{numSelected}"
        )
          +if('filterExpanded')
            input(bind:value='{filterValue}', on:click|stopPropagation, on:keydown|stopPropagation, type="text")
            +else
              Icon(icon="{faSearch}")
        span.btn.over18wrapper.tooltip(
          data-tooltip="{over18str}",
          class:over18="{!$over18}",
          on:click="{function(){toggleOver18()}}"
        )
          p nsfw
        +each('displayposts as post, i')
          span(
            class:selected="{displayposts[i].selected}",
            class:over18="{displayposts[i].over18}",
            on:click="{function(){goto(i)}}"
          )
            img.small(alt="foo", src="{displayposts[i].preview.img.default}")
            p.small(class:curr="{index === i}") {i+1}
  .prefetch
    +each('nexturls as nexturl')
      img(alt="prefetch", src="{nexturl.preview.img.default}")
      +if('nexturl.is_video')
        video
          +if('nexturl.preview.vid.webm')
            source(src="{nexturl.preview.vid.webm}")
          +if('nexturl.preview.vid.mp4')
            source(src="{nexturl.preview.vid.mp4}")
</template>
