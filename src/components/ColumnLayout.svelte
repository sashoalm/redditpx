<script>
  import Icon from "fa-svelte";
  import { faVolumeUp as faSoundOn } from "@fortawesome/free-solid-svg-icons/faVolumeUp";
  import { faVolumeMute as faSoundOff } from "@fortawesome/free-solid-svg-icons/faVolumeMute";
  import { faPlay } from "@fortawesome/free-solid-svg-icons/faPlay";
  import { faPause } from "@fortawesome/free-solid-svg-icons/faPause";
  import { faCog as faSettings } from "@fortawesome/free-solid-svg-icons/faCog";
  import { faHome } from "@fortawesome/free-solid-svg-icons/faHome";
  import { faDonate } from "@fortawesome/free-solid-svg-icons/faDonate";
  import { faExpandAlt as faExpand } from "@fortawesome/free-solid-svg-icons/faExpandAlt";
  import { faCloudDownloadAlt as faDownload } from "@fortawesome/free-solid-svg-icons/faCloudDownloadAlt";
  import { faPhotoVideo as faImageVideo } from "@fortawesome/free-solid-svg-icons/faPhotoVideo";
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
  import { faThLarge as faColumns } from "@fortawesome/free-solid-svg-icons/faThLarge";
  import { faTh as faColumnsMore } from "@fortawesome/free-solid-svg-icons/faTh";
  import { faExpandArrowsAlt as faFullscreen } from "@fortawesome/free-solid-svg-icons/faExpandArrowsAlt";
  import { faArrowsAltH as faArrows } from "@fortawesome/free-solid-svg-icons/faArrowsAltH";

  import { faMobileAlt as faPortrait } from "@fortawesome/free-solid-svg-icons/faMobileAlt";
  import { faDesktop as faLandscape } from "@fortawesome/free-solid-svg-icons/faDesktop";

  import Settings from "./Settings.svelte";
  import { onMount, afterUpdate, tick } from "svelte";
  import { goto as ahref } from "@sapper/app";

  import { get_posts, queryp } from "../_utils";

  import {
    writable,
    throttle,
    debounce,
    startWith
  } from "svelte-pipeable-store";

  import {
    autoplay,
    scrollspeed,
    imageVideo,
    portraitLandscape,
    favorite,
    over18,
    multireddit,
    prefetch,
    prefetchNum,
    hires,
    lores,
    oldreddit,
    muted,
    layout
  } from "../_prefs";
  autoplay.useLocalStorage(true);
  scrollspeed.useLocalStorage(2);
  imageVideo.useLocalStorage(0);
  portraitLandscape.useLocalStorage(0);
  favorite.useLocalStorage({});
  over18.useLocalStorage(1);
  multireddit.useLocalStorage({});
  prefetch.useLocalStorage(true);
  prefetchNum.useLocalStorage(3);
  hires.useLocalStorage(false);
  lores.useLocalStorage(true);
  oldreddit.useLocalStorage(false);
  muted.useLocalStorage(true);
  layout.useLocalStorage(0);

  export let params, slugstr;
  export let posts;
  export let after;
  export let res;

  let data;
  let displayposts = [];
  let uiVisible = true;
  let numFavorite;
  let tinygoto = false;
  let title;
  let albumindex = 0;

  let scrollPos = 0;

  let subreddit;

  $: subreddit = slugstr ? slugstr.split("/")[1] : "";

  let numCols = 3;
  let gridTemplateColsStyle;
  let cols;

  //console.log('block 1: gotoElWidth', displayposts.length, $gotoElWidth)
  if ($gotoElWidth > 2000) {
    numCols = 4 + 2;
    tinygoto = false;
  } else if ($gotoElWidth > 1440) {
    numCols = 3 + 2;
    tinygoto = false;
  } else if ($gotoElWidth > 500 && $gotoElWidth <= 1440) {
    numCols = 2 + 2;
    tinygoto = false;
  } else {
    numCols = 1 + 1;
    tinygoto = true;
  }

  $: {
    cols = Array(numCols).fill(0).map(Number.call, Number);
    gridTemplateColsStyle = `grid-template-columns: ${Array(numCols)
      .fill("1fr")
      .join(" ")}`;
  }

  // 1440 is to set numCols to 3. Setting to `0` would mean we start with 1 col, and then quickly update to 3 on desktop.
  const _gotoElWidth = writable(1440);
  const gotoElWidth = _gotoElWidth.pipe(throttle(500), startWith(1440));

  const _scrollY = writable(0);
  const scrollY = _scrollY.pipe(throttle(500), startWith(0));

  $: loadError = res && !res.res.ok;

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
  let mutedstr = "Sound Off";

  let autoplaytimer;
  let scrolldelaytimer;

  let filterRef;
  let filterExpanded = false;
  let filterValue = "";

  let showSettings = false;

  let nexturls = [];
  let index = 0;

  let innerHeight;
  let wallEl;

  async function loadMore() {
    if (!after) return;

    if (loading) return;

    loading = true;
    reloadstr = "Loading ..";

    let newposts;

    ({
      posts: newposts,
      after,
      ...res
    } = await get_posts(
      `https://reddit.com/${slugstr}.json?after=${after}&${queryp(params)}`
    ));

    // load `favorite` from localstorage
    for (let p of newposts) {
      p["favorite"] = !!($favorite || {})[p.url];
    }

    // Combine `posts` and `newposts` and remove duplicates from multiple network requests
    posts = [...posts, ...newposts].reduce(
      (r, i) => (!r.some((j) => i.id === j.id) ? [...r, i] : r),
      []
    );

    console.log("Before dedupe: ", posts.length);

    // Remove duplicates, based on `url`
    posts = posts.filter((v, i, a) => a.findIndex((t) => t.url == v.url) === i);

    console.log("After dedupe/Total loaded: ", posts.length);

    loading = false;
    reloadstr = "Load more";
  }

  let observer;

  async function handleIntersection(events) {
    events.forEach((event) => {
      let el = event.target;
      //console.log(event, el)

      let visible = event.isIntersecting;

      let _i = parseInt(el.getAttribute("i"));
      displayposts[_i] && (displayposts[_i].visible = visible);

      // Force play if the brick is visible, and have the data
      let vidEl = el.querySelector("video");
      if (
        visible &&
        (displayposts[_i].canplaythrough || displayposts[_i].playing)
      ) {
        console.log("Force playing", _i);
        vidEl.play();
      } else if (displayposts[_i] && displayposts[_i].is_video) {
        console.log("force pausing", _i);
        vidEl && vidEl.pause();
      }
    });
  }

  let observerCount = 0;

  afterUpdate(async () => {
    if (observer && observerCount != displayposts.length) {
      //console.log('setting up observers', displayposts.length)
      observerCount = displayposts.length;
      console.log("observing", displayposts.length);

      await tick();

      for (const post of document.getElementsByClassName("brick")) {
        observer.observe(post);
      }
    }
  });

  onMount(async () => {
    // Start autoplay by default
    if ($autoplay) {
      scrollPos = window.pageYOffset;
      startAutoPlay();
    }

    //observer = new IntersectionObserver(handleIntersection, {
    //  threshold: 0.25
    //});
  });

  function increaseCols() {
    numCols = numCols + 1;
  }

  function decreaseCols() {
    numCols = numCols - 1;
  }

  function toggleImageVideo() {
    $imageVideo = $imageVideo + 1;

    if ($imageVideo == 3) {
      $imageVideo = 0;
    }
  }

  function toggleMuted() {
    $muted = !$muted;
  }

  function toggleLayout() {
    $layout = $layout + 1;

    if ($layout == 2) {
      $layout = 0;
    }
  }

  function togglePortraitLandscape() {
    $portraitLandscape = $portraitLandscape + 1;

    if ($portraitLandscape == 3) {
      $portraitLandscape = 0;
    }
  }

  function stopAutoPlay(silent) {
    //console.log('STOP', autoplaytimer)
    //console.log('--------------')
    clearInterval(autoplaytimer);
    if (silent === true) {
      autoplay.set(true);
    } else {
      autoplay.set(false);
    }
  }

  function stopAndStartAutoPlay() {
    //console.log('STOP AND START autoplay')
    stopAutoPlay(true);

    // Start autoplay after 1 second
    scrolldelaytimer = setTimeout(() => {
      scrollPos = window.pageYOffset;
      //console.log('setting scrollPos = window.pageYOffset')

      // Its possible user paused the autoplay during the delay.
      // Double check the autoplay status
      if ($autoplay) {
        startAutoPlay();
      }
    }, 2500);
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

    if (autoplaytimer) {
      //console.log('CLEARINTERVAL', autoplaytimer)
      clearInterval(autoplaytimer);
    }

    // Force the scrollPos to be the current so that scroll starts immediately
    //scrollPos = window.pageYOffset

    autoplaytimer = setInterval(() => {
      if ($autoplay) {
        autoscroll();
      }
    }, 10);

    //console.log('START', autoplaytimer, scrollPos, window.pageYOffset)
    autoplay.set(true);
  }

  function autoscroll() {
    // If scrollPos != window.pageYOffset, then the user scrolled manually.
    let a = Math.floor(scrollPos);
    let b = Math.floor(window.pageYOffset);
    let c = Math.abs(a - b);
    // If c == 0, then its the exact location. If c == 1, then its the weird scrolling offset issue. Ignore
    if (c == 1 || c == 0) {
      //console.log(`[scrollTo] speed: ${$scrollspeed} ${scrollPos} (${window.pageYOffset}, ${window.scrollY}) + ${Math.floor(($scrollspeed / 5) * 5)} = ${scrollPos + Math.floor(($scrollspeed / 5) * 5)}`)
      scrollPos = scrollPos + ($scrollspeed / 10) * 5;
      window.scrollTo(0, scrollPos);
    } else {
      //console.log(`Manual scroll ${scrollPos} != ${window.pageYOffset}, ${Math.floor(scrollPos)} != ${Math.floor(window.pageYOffset)}`)
      //console.log(`${scrollPos} != ${window.pageYOffset}, ${a} != ${b}, ${Math.abs(a-b)}`)
      stopAndStartAutoPlay();
    }
  }

  function scrollSpeedPlus() {
    let newSpeed = $scrollspeed + 1;

    scrollspeed.set(Math.min(20, newSpeed));
  }

  function scrollSpeedMinus() {
    let newSpeed = $scrollspeed - 1;

    scrollspeed.set(Math.max(0, newSpeed));
  }

  function scroll(event) {
    if (!$autoplay) {
      scrollPos = window.pageYOffset;
    }
  }

  $: {
    //console.log('block 3: numFavorites')
    numFavorite = displayposts.filter((item) => item.favorite == true).length;

    if (!numFavorite) {
      downloadstr = `Nothing to download`;
    } else if (numFavorite == 1) {
      downloadstr = `Download ${numFavorite} file`;
    } else {
      downloadstr = `Download ${numFavorite} files`;
    }
    autoplaystr = `Autoplay is ${$autoplay ? "on" : "off"}`;
    deepsearchstr = `Search for ${filterValue}`;

    mutedstr = `Sound ${$muted ? "off" : "on"}`;

    if ($over18 == 0) {
      over18str = "nsfw off";
    } else if ($over18 == 1) {
      over18str = "nsfw on";
    } else if ($over18 == 2) {
      over18str = "nsfw only";
    }

    if ($imageVideo == 0) {
      imageVideoStr = "Show both image and video";
    } else if ($imageVideo == 1) {
      imageVideoStr = "Show videos only";
    } else if ($imageVideo == 2) {
      imageVideoStr = "Show images only";
    }

    if ($portraitLandscape == 0) {
      portraitLandscapeStr = "Show all media";
    } else if ($portraitLandscape == 1) {
      portraitLandscapeStr = "Show only portrait media";
    } else if ($portraitLandscape == 2) {
      portraitLandscapeStr = "Show only landscape media";
    }
  }

  $: {
    //console.log('block 5: buttons')
    let tmp = [];

    if ($over18 == 0) {
      tmp = posts.filter((item) => item.over18 == false);
    } else if ($over18 == 1) {
      tmp = posts;
    } else if ($over18 == 2) {
      tmp = posts.filter((item) => item.over18 == true);
    }

    if (filterValue) {
      tmp = tmp.filter((item) =>
        item.title.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // Filter only videos
    if ($imageVideo == 1) {
      tmp = tmp.filter((item) => item.is_video);
    }
    // Filter only images
    else if ($imageVideo == 2) {
      tmp = tmp.filter((item) => item.is_image);
    }

    if ($portraitLandscape == 1) {
      tmp = tmp.filter((item) => item.dims.width / item.dims.height <= 1.2);
    } else if ($portraitLandscape == 2) {
      tmp = tmp.filter((item) => item.dims.width / item.dims.height > 1.2);
    }

    displayposts = tmp;
  }

  $: {
    //console.log('block 6: observers')
    // This block is run very often, which can use some optimization
    // The theory is since this block depends on displayposts, when we change an attribute `currpost.visible`
    // this blocks ends up running
  }

  function toggleFullscreen() {
    var elem = document.body;
    if (
      document.fullscreenElement || // alternative standard method
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    ) {
      // current working methods
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } else {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    }
  }

  function toggleUIVisiblity() {
    uiVisible = !uiVisible;

    showhidestr = uiVisible ? "Hide (h)" : "Show (h)";
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
    $over18 = $over18 + 1;

    if ($over18 == 3) {
      $over18 = 0;
    }
    over18.set($over18);
  }

  function keydown(event) {
    // up
    if (event.keyCode == 38) {
      event.preventDefault();
      scrollSpeedPlus();
    }

    // down
    if (event.keyCode == 40) {
      event.preventDefault();
      scrollSpeedMinus();
    }

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
      toggleMuted();
    }
  }

  $: {
    //console.log('block 6: scroll')
    if (wallEl) {
      let pctScrolled = ($scrollY + innerHeight) / wallEl.scrollHeight;
      if (pctScrolled >= 0.8) {
        console.log("[scroll] loading more ...");
        loadMore();
      }
    }
  }

  function pausedHandler(event) {
    console.log("pausing", event.path[1].getAttribute("id"));
    let _i = parseInt(event.path[1].getAttribute("i"));
    displayposts[_i].paused = true;
  }

  function playHandler(event) {
    console.log("playing", event.path[1].getAttribute("id"));
    let _i = parseInt(event.path[1].getAttribute("i"));
    displayposts[_i].playing = true;
    // If it is playing, then it can playthrough as well.
    displayposts[_i].canplaythrough = true;
    displayposts[_i].paused = false;
  }

  function canPlayThroughHandler(event) {
    console.log("canplaythrough", event.path[1].getAttribute("id"));
    let _i = parseInt(event.path[1].getAttribute("i"));
    displayposts[_i].canplaythrough = true;
    event.path[0].removeEventListener("canplaythrough", canPlayThroughHandler);
    event.path[0].play();
  }
</script>

<svelte:window
  on:scroll={scroll}
  on:keydown={keydown}
  bind:scrollY={$_scrollY}
  bind:innerHeight
/>
<svelte:head>
  <title>redditpx - {slugstr ? `r/${subreddit}` : "reddit.com"}</title>
</svelte:head>
<template lang="pug">
.wrapper
  .hero
    .settings
      a.donate(href="https://ko-fi.com/redditpx" target="_blank")
        span.btn.tooltip.bottom.donate(data-tooltip="Donate")
          Icon(icon="{faDonate}")
      span.btn.tooltip.bottom.expand(on:click="{toggleFullscreen}" data-tooltip="Fullscreen")
          Icon(icon="{faExpand}")
      a.home(rel="prefetch", href="/home", class:hide='{uiVisible == false}')
        span.btn.tooltip.bottom(data-tooltip="Home")
          Icon(icon="{faHome}")
      span.btn.cog(on:click='{toggleSettings}', class:showSettings='{showSettings}', class:hide='{uiVisible == false}')
        Icon(icon="{faSettings}")
      span.btn.tooltip.bottom(data-tooltip="{showhidestr}", on:click="{toggleUIVisiblity}")
        Icon(icon="{uiVisible ? faHide : faShow }")
      .div(class:hide='{uiVisible == false}')
        Settings(bind:showSettings)
    .wall#wall(bind:this='{wallEl}', style="{gridTemplateColsStyle}")
      +each('cols as c')
        .col
          +each('displayposts as currpost, i')
            +if('i%numCols === c')
              .brick(id="{'brick-' + i}", i="{i}", on:click="{toggleAutoPlay}", class:paused="{currpost.paused}", class:canplaythrough="{currpost.canplaythrough}", class:playing="{currpost.playing}")
                +if('currpost.is_image && !currpost.is_album')
                  +if('$hires')
                    img.image(src='{currpost.url}')
                    +else()
                      img.image(src='{currpost.preview.img.default}')
                  +elseif('currpost.is_video')
                    video.video(on:pause="{pausedHandler}", on:play="{playHandler}", on:canplaythrough="{canPlayThroughHandler}", autoplay="{currpost.visible ? true: null}", playsinline, loop, muted)
                      +if('$lores')
                        source(src="{currpost.preview.vid.lores}")
                        +else()
                          +if('currpost.preview.vid.webm')
                            source(src="{currpost.preview.vid.webm}")
                          +if('currpost.preview.vid.mp4')
                            source(src="{currpost.preview.vid.mp4}")
                  +elseif('currpost.is_album')
                    +if('currpost.preview.img.album[albumindex].is_video')
                      video.video(on:pause="{pausedHandler}", on:play="{playHandler}", on:canplaythrough="{canPlayThroughHandler}", autoplay="{currpost.visible ? true: null}", playsinline, loop, muted)
                        source(src="{currpost.preview.img.album[albumindex].hires}")
                      +else()
                        +if('$hires')
                          img.image(src="{currpost.preview.img.album[albumindex].hires}")
                          +else()
                            img.image(src="{currpost.preview.img.album[albumindex].default}")
    +if('displayposts.length || posts.length')
      .goto(class:tinygoto='{tinygoto}', class:hide="{uiVisible == false}", bind:clientWidth='{$_gotoElWidth}')
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
          span.btn.layout.tooltip(
            data-tooltip="Solo mode",
            on:click="{toggleLayout}"
          )
            Icon(icon="{faFullscreen}")
          span.btn.layout.active.tooltip(
            data-tooltip="Grid mode",
            on:click="{decreaseCols}"
          )
            Icon(icon="{faColumns}")
          span.btn.layout.active.tooltip(
            data-tooltip="Grid mode",
            on:click="{increaseCols}"
          )
            Icon(icon="{faColumnsMore}")
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
          span.btn.over18wrapper.tooltip(
            data-tooltip="{over18str}",
            class:over18="{!$over18}",
            on:click="{toggleOver18}"
          )
            p {over18str}
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
          +if('filterValue')
            span.btn.deepsearch.tooltip(data-tooltip="{deepsearchstr}", on:click='{gotoDeepSearch}')
              p deep search 🠒
          span.displayinfo(class:filterExpanded="{filterValue}")
            p {displayposts.length}/{posts.length}
          span.btn.reload.tooltip(data-tooltip="{reloadstr}", on:click='{loadMore}', class:loaderror='{loadError}')
            +if('loading')
              Icon(icon="{faSpinner}")
              +else()
                Icon(icon="{faSync}")
</template>

<style lang="sass">
@mixin hover()
  @media not all and (pointer:coarse)
    &:hover
      @content

$red: #D93025
$green: #1E8E3E
$yellow: #F9AB00

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
        font-size: 1.1rem

        &.donate
          color: $yellow

        &.cog, &.expand
          font-size: 1.1rem

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

      .btnwrapper
        display: contents

      .btnwrapper

        .displayinfo
          grid-column: span 1
          font-size: 0.9rem
          font-family: "Roboto Condensed", sans-serif

          p
            margin: 0
            text-align: center
            margin-top: 2px

        .reload
          bottom: -1px
          left: 10px

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

        &.arrows
          color: white
          top: 1px

        &.layout
          cursor: pointer
          font-size: 1.4rem
          bottom: 2px

          &.active
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
          font-size: 1.48rem
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
              width: 85%
              margin-left: 0px
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
          position: relative
          background-color: #3C4043
          border: 5px solid rbga(0, 0, 0, 0)

          &.playing
            //border: 5px solid $green !important

          &.canplaythrough
            //border: 5px solid $yellow

          &.paused
            //border: 5px solid $red !important

          .image, .video
            width: 100%

            &.absolute
              position: absolute

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
