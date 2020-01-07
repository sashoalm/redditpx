<script>
  import { onMount } from  'svelte';
  import { stores } from '@sapper/app'

  import { get_posts, format } from '../_utils'

  const { page } = stores()
  const { slug } = $page.params;

  let data
  let posts = []
  let after
  let uiVisible = true

  let currpost = format({})
  let nexturls = []

  let index = 0

  async function loadMore() {
    if (!after) return;

    let newposts

    ({posts: newposts, after} = await get_posts(`https://reddit.com/r/${slug}.json?after=${after}`));

    posts = [...posts, ...newposts]
  }

  onMount(async () => {
    ({ posts, after} = await get_posts(`https://reddit.com/r/${slug}.json`))
  }
  )

  $ : {

    if (posts[index]) {
      currpost = posts[index]

      nexturls = posts.slice(index, index+3)

    }
    else {
      currpost = {}
      nexturls = []
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

  function keydown(event) {

    if (event.keyCode == 38) {
      toggleVisiblity()
    }

    if (event.keyCode == 37  || event.keyCode == 65 || event.keyCode == 75) {
      prev()
    }
    else if (event.keyCode == 39 || event.keyCode == 68 || event.keyCode == 74 || event.keyCode == 32) {
      next()
    }
  }



</script>

<style lang="sass">
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
      position: absolute
      top: 0
      background-color: rgba(0, 0, 0, 0.4)
      color: white
      font-size: 1.5rem
      max-width: 500px
      padding: 1rem
      border-radius: 3px


    .goto
      position: absolute
      background-color: rgba(0, 0, 0, 0.4)
      bottom: 0
      display: grid
      padding: 1rem
      border-radius: 3px
      color: white
      width: 100%
      grid-template-columns: repeat(auto-fill, minmax(30px, 1fr))

      p
        margin: 0 2px
        text-align: center

        &.curr
          background-color: rgba(255, 255, 255, 0.2)
          border-bottom: 3px solid red


    .control
      position: absolute
      height: 100%

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
    .title(class:hide="{uiVisible == false}") {currpost.title}
    +if('currpost.is_image')
      .image(style="background-image: url('{currpost.imgpreview}')")
      +elseif('currpost.is_video')
        +await('currpost.vidpreview then vidsrc')
          video.video(autoplay loop playsinline muted)
            source(src='{vidsrc.webm}')
            source(src='{vidsrc.mp4}')
            img(alt="foo", src='{vidsrc.gif}')

    .control.next(on:click='{next}')
    .goto(class:hide="{uiVisible == false}")
      +each('posts as post, i')
        p(class:curr="{index === i}") {i}
  .prefetch
    +each('nexturls as nexturl')
      img(alt='prefetch', src='{nexturl.imgpreview}')

</template>
