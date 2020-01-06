<script>
  import {onMount} from  'svelte';
  import {stores} from '@sapper/app'

  const {page} = stores()
  const {slug} = $page.params;

  import fetchJsonp from 'fetch-jsonp'

  let data
  let loadmoremarker
  let allposts = []
  let uiVisible = true

  async function loadMore() {
    if (!loadmoremarker) return;
    let res =  await fetchJsonp(`https://reddit.com/r/${slug}.json?after=${loadmoremarker}`, {jsonpCallback: 'jsonp'})
    data = await res.json()
    loadmoremarker = data.data.after
    console.log(allposts)
    allposts = [...allposts, ...data.data.children]
  }

  onMount(async () => {
    const res =  await fetchJsonp(`https://reddit.com/r/${slug}.json`, {jsonpCallback: 'jsonp'})
    data = await res.json()
    allposts = data.data.children
    loadmoremarker = data.data.after
  }
  )

  function is_image(item) {
    return item.data.url.startsWith('https://imgur') || item.data.url.endsWith('.jpg')
  }

  $ : posts = allposts.filter(item =>  is_image(item))

  $ : {

    if (posts[index]) {
      currpost = posts[index]

      nexturls = posts.slice(index, index+3)

    }
    else {
      currpost = {'data': {'title': 'Loading ..'}}
      nexturls = []
    }



  }

  let currpost = {'data': {'title': 'Loading ..'}}
  let nexturls = []

  let index = 0

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

    img
      object-fit: cover
      height: 100vh
      width: auto


  .prefetch
    display: none

</style>

<svelte:window on:keydown={keydown}/>

<template lang="pug">
.wrapper
  //p index - {index}, marker - {loadmoremarker}, posts.length = {posts.length}, allposts.length = {allposts.length}
  //p {url}
  //h2 nexturls
  //  +each('nexturls as nexturl')
  //  p nexturl - {nexturl.data.url}
  .hero
    .control.prev(on:click='{prev}')
    .title(class:hide="{uiVisible == false}") {currpost.data.title}
    .image(style="background-image: url('{currpost.data.url}')")
    .control.next(on:click='{next}')
    .goto(class:hide="{uiVisible == false}")
      +each('posts as post, i')
        p(class:curr="{index === i}") {i}
  .prefetch
    +each('nexturls as nexturl')
      img(alt='prefetch', src='{nexturl.data.url}')


</template>
