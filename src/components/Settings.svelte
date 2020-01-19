<script>
import Icon from "fa-svelte";
import { faCog as faSettings } from "@fortawesome/free-solid-svg-icons/faCog";
import { faTimes as faClose } from "@fortawesome/free-solid-svg-icons/faTimes";

export let showSettings;

function hideSettings() {
  showSettings = false;
}

let activeTab = 2

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

.settingspanel
  position: fixed
  background-color: black
  left: 25%
  top: 25%
  width: 50%
  height: 50%
  border-radius: 5px
  border: 1px solid white
  padding: 1rem
  display: none

  grid-template-rows: [head-start] 2.5rem [head-end contents-start] 2fr [contents-end]

  &.showSettings
    display: grid
    grid-gap: 1rem

  .contents
    grid-row: contents
    display: grid
    grid-template-columns: 1fr 2fr

    .nav
      font-size: 1.1rem

      display: grid
      grid-auto-rows: max-content
      grid-gap: 5px

      align-items: center
      justify-items: center

      // flow items one below other
      grid-auto-flow: row

      .active
        background-color: rgba(255, 255, 255, 0.2)
        border-bottom: 3px solid $accent-color

      div
        padding: 0.5rem 1rem
        border-bottom: 3px solid rgba(0, 0, 0, 0)
        width: 100%
        height: 100%
        cursor: pointer

        @include hover()
          background-color: rgba(255, 255, 255, 0.2)
          border-bottom: 3px solid $accent-color

    .options
      background-color: rgba(black, 0%)
      border-left: 1px solid white

      .option
        display: none
        padding: 0rem 1rem

        .item
          padding: 0.5rem
          margin: 0.5rem 0

          .text
            margin-right: 10px

          .key
            color: darken($text-color, 20%)
            margin: 0 4px
            border: 1px solid darken($text-color, 20%)
            border-radius: 3px
            padding: 4px 5px

      .active
        display: block

  .close
    position: absolute
    top: 1rem
    color: rgba(white, 60%)
    cursor: pointer
    right: 1rem

    @include hover()
      color: white

  .head
    font-size: 1.5rem
    align-self: center

    :global(svg)
      position: relative
      top: 3px
      margin-right: 10px

  @media (max-width: 1600px)
    width: 80%
    left: 10%

  @media (max-width: 1000px)
    width: 90%
    left: 5%

  @media (max-width: 800px)

    .contents
      grid-template-rows: 3rem auto
      grid-template-columns: unset

      .nav
        // flow items to the right
        grid-auto-flow: column
        grid-auto-rows: unset
        grid-auto-columns: max-content

      .options
        border-left-width: 0px
        border-top: 1px solid white
</style>

<template lang="pug">
.settingspanel(class:showSettings='{showSettings}')
  .head
    Icon(icon="{faSettings}")
    | Settings
  .close(on:click='{hideSettings}')
    Icon(icon="{faClose}")
  .contents
    .nav
      div(class:active='{activeTab == 1}', on:click='{function(){activeTab = 1}}') General
      div(class:active='{activeTab == 2}', on:click='{function(){activeTab = 2}}') Keybindings
    .options
      div.option(class:active='{activeTab == 1}')
        p autoplay on/off
        p download files
        p nsfw on/off
        p autoplay time
        p make all fav
        p remove all fav
        p prefetch?
        p always show hd?
        p remove duplicates
        p aggressive caching (thumb vs preview)
      div.option(class:active='{activeTab == 2}')
        .item
          span.text Play / Pause
          span.key q
          span.key p
        .item
          span.text Next item
          span.key space
          span.key right
          span.key d
          span.key j
        .item
          span.text Previous item
          span.key left
          span.key a
          span.key k
        .item
          span.text Hide UI / Controls
          span.key h
        .item
          span.text Toggle favorite
          span.key x
        .item
          span.text Remove all current subreddit's favorites
          span.key Shift + x
        .item
          span.text Remove favorites across all subreddits
          span.key Ctrl + Shift + x
        .item
          span.text Filter
          span.key /
          span.key f
        .item
          span.text Open reddit (old.reddit.com)
          span.key o
        .item
          span.text Open reddit
          span.key r
        .item
          span.text Open high-res
          span.key i
        .item
          span.text Add to multireddit
          span.key m
</template>
