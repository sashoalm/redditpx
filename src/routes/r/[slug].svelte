<script>
  import Icon from 'fa-svelte';
  import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'
  import { faPause } from '@fortawesome/free-solid-svg-icons/faPause'
  import { faCog } from '@fortawesome/free-solid-svg-icons/faCog'
  import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons/faCloudDownloadAlt'

  import { onMount } from  'svelte';
  import { stores } from '@sapper/app'

  import { get_posts, format } from '../_utils'

  const { page } = stores()
  const { slug } = $page.params;

  let data
  let posts = []
  let displayposts = []
  let res
  let after
  let uiVisible = true
  let selected = 0

  let downloadstr = ''
  let autoplaystr = ''
  let over18str = ''

  let autoplay = true
  let saferesults = false

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
    selected = displayposts.filter((item) => item.selected == true).length

    if (!selected) {
      downloadstr = `nothing to download`
    }else if (selected == 1){
      downloadstr = `download ${selected} file`
    }else {
      downloadstr = `download ${selected} files`
    }
    autoplaystr = `autoplay is ${autoplay ? "on": "off"}`
    over18str = `nsfw is ${saferesults ? "off" : "on"}`
  }


  $ : {

    if (displayposts[index]) {
      currpost = JSON.parse(JSON.stringify(displayposts[index]))

      nexturls = displayposts.slice(index+1, index+4)

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

  $ : {
    if (saferesults) {
       displayposts = posts.filter((item) => item.over18 == false)
    }else {
       displayposts = posts
    }
  }

  function goto(i) {

    index = i

    if((displayposts.length - index) === 1)  {
      loadMore()
    }


  }

  function next() {
    index += 1

    if((displayposts.length - index) === 3)  {
      loadMore()
    }
  }

  function prev() {
    if (index === 0) return;
    index -= 1

    if((displayposts.length - index) === 3)  {
      loadMore()
    }
  }

  function toggleVisiblity() {
    uiVisible = !uiVisible
  }

  async function downloadFiles() {


    //let res = await fetch('/download')
    //let pagehtml = await res.text()

    let win = window.open("", 'title');

    for(const [i, post] of displayposts.entries()) {

      if (post.selected) {
        //pagehtml += `<img src="${post.url}" />`

        // We need displayposts[i].selected here to make this change reactive
        displayposts[i].selected = false
      }
    }

    //console.log(win.document.body, pagehtml)
    win.document.body.innerHTML = '<img src="https://i.redd.it/hjt5at4l2f941.jpg" />'
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
      console.log(displayposts[index])
      displayposts[index].selected = !displayposts[index].selected
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

$yellow: #f9ab00

$text-color: #fafafa
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

    .settings
      z-index: 10
      position: absolute
      top: 0
      right: 0
      color: $text-color
      font-size: 1rem
      padding: 2rem

    .title
      z-index: 10
      position: absolute
      top: 0
      background-color: rgba(0, 0, 0, 0.4)
      color: $text-color
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
      padding: 1rem 11rem
      border-radius: 3px
      color: $text-color
      width: 100%
      grid-template-columns: repeat(auto-fill, minmax(32px, 1fr))

      .btn
        text-align: center
        padding-top: 2px
        color: rgba(white, 30%)

        &.over18

          cursor: pointer
          grid-column: span 2
          justify-self: center

          &.saferesults
            p
              border: 1px solid rgba(white, 30%)
              color: rgba(white, 30%)

              &:hover
                border: 1px solid $over18-color
                color: $over18-color

          p
            font-size: 0.9rem
            border: 1px solid $over18-color
            border-radius: 3px
            color: $over18-color
            margin: 0
            margin-right: 13px
            width: 35px
            font-family: "Roboto Condensed", sans-serif

        &.download
          cursor: default
          font-size: 1.4rem
          bottom: 3px

          &.dlready
            color: rgba($selected-color, 90%)
            cursor: pointer

            &:hover
              color: $yellow

        &.playpause
          cursor: pointer

          // When it is play icon, make it white
          &.play
            color: white

          &:hover
            color: white

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

  @media (max-width: 1000px)

    .hero
      .goto
        padding: 1rem 11rem 1rem 1rem

  @media (max-width: 800px)
    .hero
      .goto
        padding: 1rem



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
    background-color: #000
    background-color: hsla(0, 0%, 20%, 0.9)
    color: #fff
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

<svelte:window on:keydown={keydown}/>

<template lang="pug">
.wrapper
  .hero
    .control.prev(on:click='{prev}')
    .title(class:hide="{uiVisible == false}", class:selected="{currpost.selected}") {currpost.title}
    .settings(class:hide="{uiVisible == false}")
      Icon(icon='{faCog}')
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
    +if('displayposts.length')
      .goto(class:hide="{uiVisible == false}")
        span.btn.playpause.tooltip(data-tooltip="{autoplaystr}", class:play='{autoplay}', on:click='{function(){autoplay = !autoplay}}')
          Icon(icon='{autoplay ? faPause : faPlay}')
        span.btn.download.tooltip(on:click='{function(){downloadFiles()}}', data-tooltip="{downloadstr}", class:dlready="{selected}")
          Icon(icon='{faCloudDownloadAlt}')
        span.btn.over18.tooltip(data-tooltip="{over18str}", class:saferesults='{saferesults}', on:click='{function(){saferesults = !saferesults}}')
          p nsfw
        +each('displayposts as post, i')
          span(class:selected='{displayposts[i].selected}', class:over18='{displayposts[i].over18}', on:click="{function(){goto(i)}}")
            img.small(alt="foo", src="{displayposts[i].preview.img.default}")
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
