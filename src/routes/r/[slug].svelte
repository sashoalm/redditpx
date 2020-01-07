<script>
  import { onMount } from  'svelte';
  import { stores } from '@sapper/app'

  import { get_posts, format } from '../_utils'

  const { page } = stores()
  const { slug } = $page.params;

  let data
  let posts = []
  let res
  let after
  let uiVisible = true

  let currpost = {title: 'Loading ..'}
  let nexturls = []

  let index = 0

  async function loadMore() {
    if (!after) return;

    let newposts

    ({posts: newposts, after, ...res} = await get_posts(`https://reddit.com/r/${slug}.json?after=${after}`));
    console.log("loadMore", res.res.ok)

    posts = [...posts, ...newposts]
  }

  onMount(async () => {
    ({ posts, after, ...res} = await get_posts(`https://reddit.com/r/${slug}.json`))

    console.log("onMount", res.res.ok)
  }
  )

  let renderVideo = true

  $: {reMountVideo(currpost.preview)}

  function reMountVideo() {
    renderVideo = false
    setTimeout(() => renderVideo = true, 0)
  }

  $ : {

    if (posts[index]) {
      currpost = JSON.parse(JSON.stringify(posts[index]))

      nexturls = posts.slice(index+1, index+4)

    }
    else {

      if (res && res.res.ok) {

        // No media found
        currpost = {title: 'Nothing to show'}
      }else if (res && !res.res.ok){

        // Invalid subreddit
        currpost = {title: 'Error'}
      }else {

        // Default
        currpost = {title: 'Loading ..'}
      }

      nexturls = []
    }

  }

  function goto(i) {

    index = i

    if((posts.length - index) === 1)  {
      loadMore()
    }


  }

  function next() {
    index += 1

    if((posts.length - index) === 3)  {
      loadMore()
    }
  }

  function prev() {
    if (index === 0) return;
    index -= 1

    if((posts.length - index) === 3)  {
      loadMore()
    }
  }

  function toggleVisiblity() {
    uiVisible = !uiVisible
  }

  function openMedia() {
    window.open(currpost.url, '_blank')
  }

  function openSubReddit() {
    window.open(`https://reddit.com/${currpost.permalink}`, '_blank')
  }

  function openSubRedditOld() {
    window.open(`https://old.reddit.com/${currpost.permalink}`, '_blank')
  }

  function keydown(event) {
    console.log(event.keyCode)

    // x
    if (event.keyCode == 88) {
      console.log(posts[index])
      posts[index].selected = !posts[index].selected
    }

    if (event.ctrlKey) {
      return
    }

    // r
    if (event.keyCode == 82) {
      openSubReddit()
    }

    // o
    if (event.keyCode == 79) {
      openSubRedditOld()
    }

    // i
    if (event.keyCode == 73) {
      openMedia()
    }

    // Up Arrow
    if (event.keyCode == 38) {
      toggleVisiblity()
    }

    // Left Arrow, a, k
    if (event.keyCode == 37  || event.keyCode == 65 || event.keyCode == 75) {
      prev()
    }
    // Right Arrow, d, j, Space
    else if (event.keyCode == 39 || event.keyCode == 68 || event.keyCode == 74 || event.keyCode == 32) {
      next()
    }
  }



</script>

<style lang="sass">

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

    .title
      z-index: 5
      position: absolute
      top: 0
      background-color: rgba(0, 0, 0, 0.4)
      color: #fafafa
      font-size: 1.5rem
      max-width: 500px
      padding: 1rem
      border-radius: 3px

      &.selected
        color: $selected-color


    .goto
      z-index: 5
      position: absolute
      background-color: rgba(0, 0, 0, 0.6)
      bottom: 0
      display: grid
      grid-row-gap: 5px
      padding: 1rem 10rem
      border-radius: 3px
      color: #fafafa
      width: 100%
      grid-template-columns: repeat(auto-fill, minmax(32px, 1fr))


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

</style>

<svelte:window on:keydown={keydown}/>

<template lang="pug">
.wrapper
  .hero
    .control.prev(on:click='{prev}')
    .title(class:hide="{uiVisible == false}", class:selected="{currpost.selected}") {currpost.title}
    +if('currpost.is_image')
      .image(style="background-image: url('{currpost.preview.img.default}')")
      +elseif('currpost.is_video && renderVideo')
        video.video(autoplay loop playsinline muted)
          +if('currpost.preview.vid.webm')
            source(src='{currpost.preview.vid.webm}')
          +if('currpost.preview.vid.mp4')
            source(src='{currpost.preview.vid.mp4}')
          //img(alt="foo", src='{currpost.preview.vid.gif}')

    .control.next(on:click='{next}')
    .goto(class:hide="{uiVisible == false}")
      +each('posts as post, i')
        span(class:selected='{posts[i].selected}', class:over18='{posts[i].over18}', on:click="{function(){goto(i)}}")
          img.small(alt="foo", src="{posts[i].preview.img.default}")
          p.small(class:curr="{index === i}") {i+1}
  .prefetch
    +each('nexturls as nexturl')
      img(alt='prefetch', src='{nexturl.preview.img.default}')
      +if('nexturl.is_video')
        video
          +if('nexturl.preview.vid.webm')
            source(src='{nexturl.preview.vid.webm}')
          +if('nexturl.preview.vid.mp4')
            source(src='{nexturl.preview.vid.mp4}')

</template>
