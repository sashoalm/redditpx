<script>
import Icon from "fa-svelte";
import { faVolumeUp as faSoundOn } from "@fortawesome/free-solid-svg-icons/faVolumeUp";
import { faVolumeMute as faSoundOff } from "@fortawesome/free-solid-svg-icons/faVolumeMute";
import { faPlay } from "@fortawesome/free-solid-svg-icons/faPlay";
import { faPause } from "@fortawesome/free-solid-svg-icons/faPause";
import { faCog as faSettings } from "@fortawesome/free-solid-svg-icons/faCog";
import { faHome } from "@fortawesome/free-solid-svg-icons/faHome";
import { faCloudDownloadAlt as faDownload } from "@fortawesome/free-solid-svg-icons/faCloudDownloadAlt";
import { faPhotoVideo as faImageVideo} from "@fortawesome/free-solid-svg-icons/faPhotoVideo";
import { faImage } from "@fortawesome/free-solid-svg-icons/faImage";
import { faVideo } from "@fortawesome/free-solid-svg-icons/faVideo";
import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
import { faTimes as faClose } from "@fortawesome/free-solid-svg-icons/faTimes";
import { faSync } from "@fortawesome/free-solid-svg-icons/faSync";
import { faExclamationTriangle as faLoadError } from "@fortawesome/free-solid-svg-icons/faExclamationTriangle";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons/faPlusCircle";
import { faMinusCircle } from "@fortawesome/free-solid-svg-icons/faMinusCircle";
import { faEye as faShow } from "@fortawesome/free-solid-svg-icons/faEye";
import { faEyeSlash as faHide } from "@fortawesome/free-solid-svg-icons/faEyeSlash";

import { faMobileAlt as faPortrait } from "@fortawesome/free-solid-svg-icons/faMobileAlt";
import { faDesktop as faLandscape } from "@fortawesome/free-solid-svg-icons/faDesktop";

import Settings from './Settings.svelte'
import { onMount, tick } from "svelte";
import { goto as ahref } from "@sapper/app";

import { get_posts, queryp } from "../_utils";

import { autoplay, scrollspeed, imageVideo, portraitLandscape, favorite, over18, multireddit, prefetch, hires, oldreddit, muted } from "../_prefs";
import Display from "./Display.svelte";
autoplay.useLocalStorage(true);
scrollspeed.useLocalStorage(2);
imageVideo.useLocalStorage(0);
portraitLandscape.useLocalStorage(0);
favorite.useLocalStorage({});
over18.useLocalStorage(1);
multireddit.useLocalStorage({});
prefetch.useLocalStorage(true);
hires.useLocalStorage(false);
oldreddit.useLocalStorage(false);
muted.useLocalStorage(true);

export let params, slugstr;
export let posts;
export let after;
export let res;

let data;
let displayposts = [];
let uiVisible = true;
let numFavorite;
let tinygoto;
let title
let albumindex = 0

let scrollPos = 0

let subreddit

$ : subreddit = slugstr ? slugstr.split('/')[1] : ""

$: {
  if (gotoElWidth > 1000) {
    // padding on both sides
    let numGotoControlsInOneRow = (gotoElWidth - 154 * 2) / 32;
    let numGotoControlsRows =
      (displayposts.length + 5) / numGotoControlsInOneRow;
    tinygoto = numGotoControlsRows > 3;
    numCols = 3
  } else if (gotoElWidth > 800) {
    // padding on right side
    let numGotoControlsInOneRow = (gotoElWidth - (154 + 14)) / 32;
    let numGotoControlsRows =
      (displayposts.length + 5) / numGotoControlsInOneRow;
    tinygoto = numGotoControlsRows > 3;
    numCols = 3
  } else {
    // no padding
    let numGotoControlsInOneRow = (gotoElWidth - (14 + 14)) / 32;
    let numGotoControlsRows =
      (displayposts.length + 5) / numGotoControlsInOneRow;
    tinygoto = numGotoControlsRows > 3;
    numCols = 1
  }
}

let gotoElWidth;

$: loadError = res && !res.res.ok;

let numCols = 3
let gridTemplateColsStyle
let cols
$: {
  cols = Array(numCols).fill(0).map(Number.call, Number)
  gridTemplateColsStyle = `grid-template-columns: ${Array(numCols).fill('1fr').join(' ')}`
}



let loading = false;
let reloadstr = "Load more";
let navigation = false;

let imageVideoStr = "";
let portraitLandscapeStr = "";
let downloadstr = "";
let autoplaystr = "";
let over18str = "";
let deepsearchstr = "";
let multiredditstr = "";
let showhidestr = "Hide (h)";
let mutedstr = "Sound Off"

let autoplaytimer;
let scrolldelaytimer;

let filterRef;
let filterExpanded = false;
let filterValue = "";

let showSettings = false;

let nexturls = [];
let index = 0;

let scrollY
let innerHeight
let wallEl

async function loadMore() {
  if (!after) return;

  if (loading) return;

  loading = true;
  reloadstr = "Loading ..";

  let newposts;

  ({ posts: newposts, after, ...res } = await get_posts(
    `https://reddit.com/${slugstr}.json?after=${after}&${queryp(params)}`
  ));

  // load `favorite` from localstorage
  for (let p of newposts) {
    p["favorite"] = !!$favorite[p.url];
  }

  // Combine `posts` and `newposts` and remove duplicates from multiple network requests
  posts = [...posts, ...newposts].reduce(
    (r, i) => (!r.some(j => i.id === j.id) ? [...r, i] : r),
    []
  );

  console.log("Total loaded: ", posts.length)

  loading = false;
  reloadstr = "Load more";
}

onMount(async () => {
  // Start autoplay by default
  if ($autoplay) {
    scrollPos = window.pageYOffset
    startAutoPlay();
  }
});

function toggleImageVideo() {

  $imageVideo = $imageVideo + 1

  if ($imageVideo == 3) {
    $imageVideo = 0
  }
}

function toggleMuted() {

  $muted = !$muted

}

function togglePortraitLandscape() {
  $portraitLandscape = $portraitLandscape + 1

  if ($portraitLandscape == 3) {
    $portraitLandscape = 0
  }
}

function stopAutoPlay(silent) {
  //console.log('STOP', autoplaytimer)
  //console.log('--------------')
  clearInterval(autoplaytimer);
  if (silent === true) {
    autoplay.set(true);
  }
  else {
    autoplay.set(false);
  }
}

function stopAndStartAutoPlay() {
  //console.log('STOP AND START autoplay')
  stopAutoPlay(true);

  // Start autoplay after 1 second
  scrolldelaytimer = setTimeout(() => {
      scrollPos = window.pageYOffset
    //console.log('setting scrollPos = window.pageYOffset')
      startAutoPlay()
  }, 2000);

}

function toggleAutoPlay() {
  if ($autoplay) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
}

function startAutoPlay() {
  //console.log('--------------')

  if(autoplaytimer) {
    //console.log('CLEARINTERVAL', autoplaytimer)
    clearInterval(autoplaytimer)
  }

  // Force the scrollPos to be the current so that scroll starts immediately
  //scrollPos = window.pageYOffset

  autoplaytimer = setInterval(() => {
    if ($autoplay) {
      autoscroll()
    }
  }, 10);


  //console.log('START', autoplaytimer, scrollPos, window.pageYOffset)
  autoplay.set(true);
}

function autoscroll() {

  // If scrollPos != window.pageYOffset, then the user scrolled manually.
  let a = Math.floor(scrollPos)
  let b = Math.floor(window.pageYOffset)
  let c = Math.abs(a-b)
  // If c == 0, then its the exact location. If c == 1, then its the weird scrolling offset issue. Ignore
  if ((c == 1) || (c == 0)) {
    //console.log(`[scrollTo] speed: ${$scrollspeed} ${scrollPos} (${window.pageYOffset}, ${window.scrollY}) + ${Math.floor(($scrollspeed / 5) * 5)} = ${scrollPos + Math.floor(($scrollspeed / 5) * 5)}`)
    scrollPos = scrollPos + (($scrollspeed / 5) * 5)
    window.scrollTo(0, scrollPos)

  }
  else {
    //console.log(`Manual scroll ${scrollPos} != ${window.pageYOffset}, ${Math.floor(scrollPos)} != ${Math.floor(window.pageYOffset)}`)
    //console.log(`${scrollPos} != ${window.pageYOffset}, ${a} != ${b}, ${Math.abs(a-b)}`)
    stopAndStartAutoPlay()
  }
}

function scroll(event)  {
  if(!$autoplay) {
    scrollPos = window.pageYOffset
  }
}


$: {
  numFavorite = displayposts.filter(item => item.favorite == true).length;

  if (!numFavorite) {
    downloadstr = `Nothing to download`;
  } else if (numFavorite == 1) {
    downloadstr = `Download ${numFavorite} file`;
  } else {
    downloadstr = `Download ${numFavorite} files`;
  }
  autoplaystr = `Autoplay is ${$autoplay ? "on" : "off"}`;
  deepsearchstr = `Search for ${filterValue}`;

  mutedstr = `Sound ${$muted ? "off": "on"}`

  if ($over18 == 0) {
    over18str = "nsfw off"
  } else if ($over18 == 1) {
    over18str = "nsfw on"
  } else if ($over18 == 2) {
    over18str = "nsfw only"
  }

  if ($imageVideo == 0) {
    imageVideoStr = "Show both image and video"
  }
  else if ($imageVideo == 1) {
    imageVideoStr = "Show videos only"
  }
  else if ($imageVideo == 2) {
    imageVideoStr = "Show images only"
  }

  if ($portraitLandscape == 0) {
    portraitLandscapeStr = "Show all media"
  }
  else if ($portraitLandscape == 1) {
    portraitLandscapeStr = "Show only portrait media"
  }
  else if ($portraitLandscape == 2) {
    portraitLandscapeStr = "Show only landscape media"
  }

}

$: {
  if (filterValue) {
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
      //currpost = { title: "Nothing to show. Try changing filters or tweak/update URL." };
    }
  } else {
    if (res && res.res.ok) {
      // No media found
      //currpost = { title: "Nothing to show. Try changing filters or tweak/update URL." };
    } else if (res && !res.res.ok) {
      // Invalid subreddit
      //currpost = { title: "Error" };
    } else {
      // Default
      //currpost = { title: "Loading .." };
    }

    nexturls = [];
  }
}

$: {
  let tmp = [];

  if ($over18 == 0) {
    tmp = posts.filter(item => item.over18 == false);
  }
  else if ($over18 == 1) {
    tmp = posts
  }
  else if ($over18 == 2) {
    tmp = posts.filter(item => item.over18 == true);
  }

  if (filterValue) {
    tmp = tmp.filter(item =>
      item.title.toLowerCase().includes(filterValue.toLowerCase())
    );
  }

  // Filter only videos
  if ($imageVideo == 1) {
    tmp = tmp.filter(item => item.is_video);
  }
  // Filter only images
  else if ($imageVideo == 2) {
    tmp = tmp.filter(item => item.is_image);
  }

  if ($portraitLandscape == 1) {
    tmp = tmp.filter(item => (item.dims.width / item.dims.height) <= 1.2)
  }
  else if ($portraitLandscape == 2) {
    tmp = tmp.filter(item => (item.dims.width / item.dims.height) > 1.2)
  }

  displayposts = tmp;
}

function toggleUIVisiblity() {
  uiVisible = !uiVisible;

  showhidestr = uiVisible ? "Hide (h)" : "Show (h)"
}

function toggleSettings() {
  showSettings = !showSettings;
}

function gotoDeepSearch() {

  let prefix = "";
  if (slugstr) {
    prefix = `/r/${subreddit}`;
  } else {
    prefix = ``;
  }

  navigation = true;
  ahref(
    `${prefix}/search?q=${filterValue}&restrict_sr=on&include_over_18=on&sort=relevant&t=all`
  );
}

function hideSettings() {
  showSettings = false;
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
  window.open("/download", "_blank");
}

function openComments() {
  //window.open(`https://reddit.com/${currpost.permalink}`, "_blank");
}

function openCommentsOld() {
  //window.open(`https://old.reddit.com/${currpost.permalink}`, "_blank");
}

function openDuplicates() {
  //window.open(`https://old.reddit.com/${currpost.subredditp}/duplicates/${currpost.id}`, "_blank");
}

function toggleOver18() {
  $over18 = $over18 + 1

  if ($over18 == 3) {
    $over18 = 0
  }
  over18.set($over18);
}

function keydown(event) {

  // q, p, Space
  if (event.keyCode == 81 || event.keyCode == 80 || event.keyCode == 32) {
    toggleAutoPlay();
    event.preventDefault();
  }

  // slash, f
  if (event.keyCode == 191 || event.keyCode == 70) {
    expandFilter();
    // We need this, otherwise filter box will have '/' because of autofocus
    event.preventDefault();
  }

  // h
  if (event.keyCode == 72) {
    toggleUIVisiblity();
  }

  // s
  if (event.keyCode == 83) {
    toggleMuted()
  }
}

$ : {
  if(wallEl) {
    let pctScrolled = (scrollY + innerHeight) / wallEl.scrollHeight
    if (pctScrolled >= 0.8) {
      console.log('loading more ...')
      loadMore()
    }
  }
}
</script>

<style lang="sass">
@mixin hover()
  @media not all and (pointer:coarse)
    &:hover
      @content

$yellow: #f9ab00

$text-color: #fafafa
$accent-color: white
$favorite-color: #fbbc04
$favorite-border-color: #e37400
$over18-color: #ea4335
$over18-border-color: #ea4335
$ismulti-color: #ea4335
$isnotmulti-color: #34a853
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

    .settings
      z-index: 10
      position: fixed
      top: 0
      right: 0
      color: $text-color
      font-size: 1rem
      padding: 1.5rem 2rem

      .btn
        user-select: none
        cursor: pointer
        color: rgba(white, 80%)
        margin-left: 10px
        font-size: 1.2rem

        &.cog
          font-size: 1.1rem

        &.showhide
          top: 1px

        &.showSettings
          color: white

        @include hover()
          color: white

    .goto
      user-select: none
      z-index: 5
      position: fixed
      background-color: rgba(0, 0, 0, 0.6)
      bottom: 0
      display: grid
      grid-row-gap: 5px
      padding: 1rem 11rem
      border-radius: 3px
      color: $text-color
      width: 100%
      grid-template-columns: repeat(auto-fill, minmax(32px, 1fr))

      &.tinygoto
        grid-template-rows: auto 1fr
        grid-template-columns: 1fr

        .btnwrapper
          grid-template-columns: repeat(auto-fill, minmax(32px, 1fr))
          display: grid

        .numswrapper
          grid-template-columns: repeat(auto-fit, minmax(1rem, auto))
          grid-auto-columns: max-content
          display: grid
          grid-gap: 0.2rem

          .nums
            border-bottom: 3px solid rgba(white, 30%)
            height: 1rem
            cursor: pointer

            @include hover()
              border-bottom: 3px solid $accent-color !important

            &.currnum
              border-bottom: 3px solid $accent-color !important

              &.album
                border-bottom: 3px dotted $accent-color !important

            &.favorite
              border-bottom: 3px solid $favorite-color

            &.over18
              border-bottom: 3px solid $over18-color

          p
            display: none

          .reload
            grid-column: span 2

      .btnwrapper, .numswrapper
        display: contents

      .btnwrapper
        .reload
          bottom: -1px

      .btn
        text-align: center
        padding-top: 2px
        color: rgba(white, 30%)

        &.reload
          cursor: pointer

          &.loaderror
            color: $over18-color

          @include hover()
            color: white

        &.deepsearch
          grid-column: span 4
          bottom: 2px
          cursor: pointer
          justify-self: center

          &:hover p
            color: $accent-color
            border: 1px solid $accent-color

          p
            margin: 0
            font-size: 0.9rem
            color: darken($accent-color, 30%)
            border: 1px solid darken($accent-color, 30%)
            border-radius: 3px
            padding: 0 1rem

        &.over18wrapper

          cursor: pointer
          grid-column: span 2
          justify-self: center

          &.over18

            p
              border: 1px solid rgba(white, 30%)
              color: rgba(white, 30%)

              @include hover()
                border: 1px solid rgba(white, 60%)
                color: rgba(white, 60%)

          p
            font-size: 0.9rem
            border: 1px solid $over18-color
            border-radius: 3px
            color: $over18-color
            margin: 0
            //margin-right: 13px
            width: 58px
            font-family: "Roboto Condensed", sans-serif
            position: relative
            top: -1px

        &.imagevideo
          cursor: pointer
          font-size: 1.4rem
          bottom: 2px
          color: white

        &.muted
          cursor: pointer
          font-size: 1.4rem
          bottom: 2px
          color: white

        &.portraitlandscape
          cursor: pointer
          font-size: 1.4rem
          bottom: 2px
          color: white

          & :global(.landscape)
            transform: rotate(270deg)

        &.download
          cursor: default
          font-size: 1.4rem
          bottom: 2px

          &.dlready
            color: rgba($favorite-color, 90%)
            cursor: pointer

            @include hover()
              color: $yellow

        &.playpause
          cursor: pointer
          top: 1px

          // When it is play icon, make it white
          &.play
            color: white

          @include hover()
            color: white

        &.filter
          cursor: pointer
          top: 1px

          @include hover()
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

    .wall
      display: grid
      grid-gap: 10px

      .col
        display: flex
        flex-flow: column
        row-gap: 10px

        .brick
          display: grid

          .image, .video
            width: 100%

  @media (max-width: 1000px)
    .hero
      .goto
        padding: 1rem 11rem 1rem 1rem

  @media (max-width: 800px)
    .hero
      .goto
        padding: 1rem
        //grid-template-columns: 32px 32px 32px 32px 32px repeat(auto-fit, minmax(32px, 1fr))
        //grid-template-rows: 1fr 1fr

        &.tinygoto

          .nums
            height: 0.1rem !important
        img.small
          display: none
</style>
<svelte:window on:scroll={scroll} on:keydown={keydown} bind:scrollY={scrollY} bind:innerHeight={innerHeight}/>
<svelte:head>
  <title>redditpx - {slugstr ? `r/${subreddit}` : 'reddit.com'}</title>
</svelte:head>
<template lang="pug">
.wrapper
  .hero
    .settings
      a.home(rel="prefetch", href="/home", class:hide='{uiVisible == false}')
        span.btn.tooltip.bottom(data-tooltip="Home")
          Icon(icon="{faHome}")
      span.btn.cog(on:click='{toggleSettings}', class:showSettings='{showSettings}', class:hide='{uiVisible == false}')
        Icon(icon="{faSettings}")
      span.btn.tooltip.bottom.showhide(data-tooltip="{showhidestr}", on:click="{toggleUIVisiblity}")
        Icon(icon="{uiVisible ? faHide : faShow }")
      .div(class:hide='{uiVisible == false}')
        Settings(bind:showSettings)
    .wall(bind:this='{wallEl}', style="{gridTemplateColsStyle}")
      +each('cols as c')
        .col
          +each('displayposts as currpost, i')
            +if('i%numCols === c')
              .brick(on:mouseenter="{currpost.hover = true}", on:mouseleave="{currpost.hover = false}", class:portrait="{currpost.orientation == 'portrait'}")
                +if('currpost.is_image && !currpost.is_album')
                  +if('$hires')
                    img.image(src='{currpost.url}')
                    +else()
                      img.image(src='{currpost.preview.img.default}')
                  +elseif('currpost.is_video')
                    video.video(autoplay, playsinline, loop, muted="{!!currpost.hover}")
                      +if('currpost.preview.vid.webm')
                        source(src="{currpost.preview.vid.webm}")
                      +if('currpost.preview.vid.mp4')
                        source(src="{currpost.preview.vid.mp4}")
                  +elseif('currpost.is_album')
                    +if('currpost.preview.img.album[albumindex].is_video')
                      video.video(autoplay, playsinline, loop, muted="{!!currpost.hover}")
                        source(src="{currpost.preview.img.album[albumindex].hires}")
                      +else()
                        +if('$hires')
                          img.image(src="{currpost.preview.img.album[albumindex].hires}")
                          +else()
                            // Use reddit's optimized image for index 0
                            +if('albumindex === 0')
                              img.image(src="{currpost.preview.img.default}")
                              +else()
                                img.image(src="{currpost.preview.img.album[albumindex].default}")
    +if('displayposts.length || posts.length')
      .goto(class:tinygoto='{tinygoto}', class:hide="{uiVisible == false}", bind:clientWidth='{gotoElWidth}')
        .btnwrapper
          span.btn.playpause.tooltip(
            data-tooltip="{autoplaystr}",
            class:play="{$autoplay}",
            on:click="{toggleAutoPlay}"
          )
            Icon(icon="{$autoplay ? faPause : faPlay}")
          span.btn.download.tooltip(
            on:click="{downloadFiles}",
            data-tooltip="{downloadstr}",
            class:dlready="{numFavorite}"
          )
            Icon(icon="{faDownload}")
          span.btn.portraitlandscape.tooltip(
            on:click="{togglePortraitLandscape}",
            data-tooltip="{portraitLandscapeStr}",
            class:active="{$portraitLandscape}"
          )
            +if('$portraitLandscape == 0')
              Icon(icon="{faLandscape}")
              +elseif('$portraitLandscape == 1')
                Icon(icon="{faPortrait}")
              +elseif('$portraitLandscape == 2')
                Icon(class="landscape", icon="{faPortrait}")
          span.btn.imagevideo.tooltip(
            data-tooltip="{imageVideoStr}",
            on:click="{toggleImageVideo}"
          )
            +if('$imageVideo == 0')
              Icon(icon="{faImageVideo}")
              +elseif('$imageVideo == 1')
                Icon(icon="{faVideo}")
              +elseif('$imageVideo == 2')
                Icon(icon="{faImage}")
          span.btn.muted.tooltip(
            data-tooltip="{mutedstr}",
            on:click="{toggleMuted}"
          )
            Icon(icon="{$muted ? faSoundOff : faSoundOn}")
          +if('tinygoto')
            span.btn.reload.tooltip(data-tooltip="{reloadstr}", on:click='{loadMore}', class:loaderror='{loadError}')
              +if('loading')
                Icon(icon="{faSpinner}")
                +else()
                  Icon(icon="{faSync}")
          span.btn.filter.tooltip(
            class:filterExpanded="{filterExpanded}",
            on:click="{toggleFilter}",
            data-tooltip="Filter ( / )",
            bind:this='{filterRef}'
            class:dlready="{numFavorite}"
          )
            +if('filterExpanded')
              input(bind:value='{filterValue}', on:click|stopPropagation, on:keydown|stopPropagation, type="text")
              +else
                Icon(icon="{faSearch}")
          span.btn.over18wrapper.tooltip(
            data-tooltip="{over18str}",
            class:over18="{!$over18}",
            on:click="{toggleOver18}"
          )
            p {over18str}
        .numswrapper
          +if('filterValue')
            span.btn.deepsearch.tooltip(data-tooltip="{deepsearchstr}", on:click='{gotoDeepSearch}')
              p deep search 🡒
          +if('!tinygoto')
            span.btn.reload.tooltip(data-tooltip="{reloadstr}", on:click='{loadMore}', class:loaderror='{loadError}')
              +if('loading')
                Icon(icon="{faSpinner}")
                +else()
                  Icon(icon="{faSync}")
</template>
