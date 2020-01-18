<script>
import Icon from "fa-svelte";
import { faCog as faSettings } from "@fortawesome/free-solid-svg-icons/faCog";

import Settings from '../components/Settings.svelte'

import { selected, multireddit } from "../_prefs";
selected.useLocalStorage({});
multireddit.useLocalStorage({});

let showSettings = false;

function toggleSettings() {
  showSettings = !showSettings;
}

let displayposts = []
let mreddits = []

$ : displayposts = $selected ? Object.entries($selected) : [];
$ : mreddits = $multireddit ? Object.entries($multireddit) : []

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

      &:hover
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

      .items
        display: grid
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
        grid-gap: 10px
        margin-top: 5px

        .item
          padding: 1rem
          height: 10rem
          background-size: cover
          background-position: center

          span
            background-color: black
            padding: 0.3rem
            border-radius: 3px

          &:hover
            background-color: rgba(white, 20%)
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
      .heading Multireddit
      .items
        +each('mreddits as [mreddit, mrdetails]')
          .item(style='background-image: url("{mrdetails.preview}")' )
            span {"r/" + mreddit}
    .block.favs
      .heading Favorites
      .items
        +each('displayposts as [url, post]')
          .item {url}
</template>
