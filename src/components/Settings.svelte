<script>
import Icon from "fa-svelte";
import { faCog as faSettings } from "@fortawesome/free-solid-svg-icons/faCog";
import { faTimes as faClose } from "@fortawesome/free-solid-svg-icons/faTimes";

export let showSettings;

function hideSettings() {
  showSettings = false;
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
      div General
      div Keybindings
    .options
      div
        p autoplay on/off
        p download files
        p nsfw on/off
        p autoplay time
        p make all fav
        p remove all fav
        p prefetch?
        p always show hd?
        p remove duplicates
      div
        p play/pause q,p
        p next space, right, d,  j
        p prev left, a, k
        p hide h
        p fav x
        p undofav shift-x
        p undoallfav ctrl-shift-x
        p undoallfav ctrl-shift-x
        p filter /, f
        p subreddit-old,  o
        p subreddit-default,  r
        p highres,  i
        p multireddit m
</template>
