<script>
  import {onMount} from  'svelte';
  import {stores} from '@sapper/app'

  const {page} = stores()
  const {slug} = $page.params;

  import fetchJsonp from 'fetch-jsonp'

  let data
  let allposts = []

  onMount(async () => {
    const res =  await fetchJsonp(`https://reddit.com/r/${slug}.json`, {jsonpCallback: 'jsonp'})
    data = await res.json()
    allposts = data.data.children
  }
  )

  function is_image(item) {

    console.log(item.data.url)
    return item.data.url.startsWith('https://imgur') || item.data.url.endsWith('.jpg')

  }

  $ : posts = allposts.filter(item =>  is_image(item))


</script>

{#each posts as post}
  <img alt = 'foo' src = '{post.data.url}'/>
{/each}
