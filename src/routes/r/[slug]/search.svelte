<script>
  import {onMount} from 'svelte'

  import {goto} from '@sapper/app'


  onMount(() => goto('/r/gifs', {replaceState: false}))
</script>
