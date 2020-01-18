<script>
import Icon from "fa-svelte";
import { faCog as faSettings } from "@fortawesome/free-solid-svg-icons/faCog";

import Settings from '../components/Settings.svelte'

let showSettings = false;

function toggleSettings() {
  showSettings = !showSettings;
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

    grid-template-columns: auto
    display: grid
    justify-items: center
    align-items: center

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
</template>
