<script>
import Icon from "fa-svelte";
import { faCog as faSettings } from "@fortawesome/free-solid-svg-icons/faCog";

import { faCloudDownloadAlt as faDownload } from "@fortawesome/free-solid-svg-icons/faCloudDownloadAlt";
import { faEye as faSlideshow } from "@fortawesome/free-solid-svg-icons/faEye";
import { faTimesCircle as faClose } from "@fortawesome/free-solid-svg-icons/faTimesCircle";

import Settings from "../components/Settings.svelte";

import { goto as ahref } from "@sapper/app";

import { selected, multireddit } from "../_prefs";
selected.useLocalStorage({});
multireddit.useLocalStorage({});

let showSettings = false;

function toggleSettings() {
  showSettings = !showSettings;
}

let displayposts = [];
let mreddits = [];

$: displayposts = $selected ? Object.entries($selected) : [];
$: mreddits = $multireddit ? Object.entries($multireddit) : [];
$: slideshowurl = $multireddit
  ? `/r/${Object.keys($multireddit).join("+")}`
  : "";

async function downloadFiles() {
  window.open("/download", "_blank");
}

function openSlideshow() {
  ahref(slideshowurl);
}

function removeFav(url) {
  $selected[url] = undefined;
  $selected = JSON.parse(JSON.stringify($selected));

  selected.set($selected);
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
$selected-color: #fbbc04
$selected-border-color: #e37400
$over18-color: #ea4335
$over18-border-color: #ea4335


.wrapper
  height: 100vh

  display: grid
  justify-items: center
  align-items: center

  .hero
    height: 100vh
    width: 100%
    display: grid
    justify-items: center
    align-items: center
    grid-auto-rows: max-content
    grid-row-gap: 3rem
    padding-top: 5rem

    .settings
      z-index: 10
      position: absolute
      top: 0
      right: 0
      color: $text-color
      font-size: 1rem
      padding: 1.5rem

      .btn
        user-select: none
        cursor: pointer
        color: rgba(white, 80%)

        &.showSettings
          color: white

        @include hover()
          color: white

    .title
      z-index: 10
      position: absolute
      top: 0
      color: darken($text-color, 20%)
      font-size: 1.5rem
      max-width: 90%
      padding: 1rem
      border-radius: 3px
      cursor: pointer

      @include hover()
        color: $text-color

      .logo
        user-select: none
        cursor: pointer
        top: 5px
        position: relative
        margin-right: 9px

        img
          height: 2rem
    .block
      color: $text-color
      padding: 1rem
      width: 100%
      align-self: start

      .heading
        font-size: 1.5rem

        .icon
          top: 3px
          position: relative
          margin-left: 8px

          &.selected
            color: $selected-color

      .items
        display: grid
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
        grid-gap: 10px
        margin-top: 5px

        .itemwrapper

          &:hover .icon
           opacity: 1

          .icon
            position: relative
            float: right
            margin: 1.1rem
            opacity: 0
            color: $selected-color
            font-size: 1.3rem

          a
            color: $text-color
            text-decoration: none

            .item
              padding: 1rem
              height: 10rem
              background-size: cover
              background-position: center

              span
                background-color: black
                padding: 0.3rem
                border-radius: 3px

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
    background-color: black
    color: #fff

    background-color: rgba(white, 90%)
    color: black

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

<template lang="pug">
.wrapper
  .hero
    .title
      span.logo
        img(alt="redditpx logo", src="logo-192.png")
      | redditpx
    .settings
      span.btn(on:click='{toggleSettings}', class:showSettings='{showSettings}')
        Icon(icon="{faSettings}")
      Settings('{showSettings}')
    .block.multireddit
      .heading Multireddit {"(" + mreddits.length + ")"}
        +if('mreddits.length')
          span.icon.tooltip(on:click="{openSlideshow}", data-tooltip="start slideshow", class:selected='{mreddits.length}')
            Icon(icon="{faSlideshow}")
      .items
        +each('mreddits as [mreddit, mrdetails]')
          .itemwrapper
            a(href='{`/r/${mreddit}`}', rel="prefetch")
              .item(style='background-image: url("{mrdetails.preview}")' )
                span {"r/" + mreddit}
    .block.favs
      .heading Favorites {"(" + displayposts.length + ")"}
        +if('displayposts.length')
          span.icon.tooltip(on:click="{downloadFiles}", data-tooltip="download all", class:selected='{displayposts.length}')
            Icon(icon="{faDownload}")
      .items
        +each('displayposts as [url, post]')
          .itemwrapper
            span.icon.tooltip(on:click|stopPropagation|preventDefault="{function() {removeFav(url)}}", data-tooltip="remove")
              Icon(icon="{faClose}")
            a(href='{post.url}', target='_blank')
              .item(style='background-image: url("{post.preview.img.default}")' )
                a(href='{`/r/${post.subreddit}`}')
                  span {"r/" + post.subreddit}
</template>
