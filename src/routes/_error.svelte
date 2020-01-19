<script>
import { goto as ahref } from "@sapper/app";

  if (typeof window !== "undefined") {
    ahref('/home', {replaceState: false});
  }
</script>
