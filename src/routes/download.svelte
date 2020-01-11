<script>
import Icon from "fa-svelte";
import { faCloudDownloadAlt as faDownload } from "@fortawesome/free-solid-svg-icons/faCloudDownloadAlt";

import { selected } from "./_prefs";
selected.useLocalStorage({})

let filterValue
let displayposts

$ : {
  let tmp
  if (filterValue) {
    tmp = Object.entries($selected).filter((item) => {

      let details = item[1]

      // poor mans search
      // Find all the `values`, make a giant string and substring match
      return Object.values(details).join(' ').includes(filterValue)

    })
    displayposts = tmp
  }else {
    displayposts = $selected ? Object.entries($selected) : []
  }




  }

</script>

<style lang="sass">

$text-color: #fafafa

.wrapper
  color: $text-color

  .title
    z-index: 10
    position: absolute
    top: 0
    background-color: rgba(0, 0, 0, 0.4)
    color: $text-color
    font-size: 1.5rem
    padding: 1rem
    border-radius: 3px

    &:hover
      background-color: rgba(0, 0, 0, 0.8)

    :global(svg)
      margin-right: 10px
      top: 3px
      position: relative

    p.main
      display: inline-block
      margin: 0
      margin-bottom: 0.5rem

    .subtitle
      font-size: 1rem
      color: darken($text-color, 10%)

      p.sub
        margin: 0

    .filter
      span
        font-size: 1rem
        margin-right: 10px

      input
        padding-left: 5px
        padding-right: 5px
        border: 1px solid rgba(white, 60%)
        background-color: rgba(0, 0, 0, 0)
        color: white
        height: 1.5rem

  .imgwrapper
    display: grid
    grid-gap: 2rem
    justify-content: center
    align-content: center

    img
      max-width: 100%
      justify-self: center

    video
      max-width: 100%
      justify-self: center

</style>

<svelte:head>
  <title>redditpx download</title>
</svelte:head>


<template lang="pug">
.wrapper
  .title
    Icon(icon="{faDownload}")
    p.main redditpx.com download {$selected ? `(${Object.keys($selected).length} items)` : '' }
    .subtitle
      p.sub Right click on the page (not on any image) > Save as > Select "Webpage, Complete".
      p.sub Alternatively, hit Ctrl+S > Select "Webpage, Complete"
    .filter
      span Filter ({displayposts.length})
      input(bind:value='{filterValue}', type="text")

  .imgwrapper
    +each('displayposts as [url, post]')
      +if('post.is_image')
        .media
          img(alt="image", src='{url}')
      +if('post.is_video')
        .media
          video(autoplay, loop, playsinline, muted)
            +if('post.preview.vid.webm')
              source(src="{post.preview.vid.webm}")
            +if('post.preview.vid.mp4')
              source(src="{post.preview.vid.mp4}")
</template>
