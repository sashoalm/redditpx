<script>
  import { selected } from "./_prefs";
  selected.useLocalStorage({})
</script>

<style lang="sass">
.wrapper
  padding: 1rem
  color: white
</style>


<template lang="pug">
.wrapper
  h1 redditpx.com Download
  h3 Right click on the page (not on any image) > Save as > Select "Webpage, Complete"
  h4 Alternatively, hit Ctrl+S > Select "Webpage, Complete"

  center
    +if('$selected')
      +each('Object.entries($selected) as [url, post]')
        +if('post.is_image')
          img(alt="image", src='{url}')
        +if('post.is_video')
          video(autoplay, loop, playsinline, muted)
            +if('post.preview.vid.webm')
              source(src="{post.preview.vid.webm}")
            +if('post.preview.vid.mp4')
              source(src="{post.preview.vid.mp4}")
</template>
