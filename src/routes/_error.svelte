<script>
  import { goto as ahref } from "@sapper/app";

  import { stores } from "@sapper/app";
  const { page } = stores();

  if (typeof window !== "undefined") {
    if ($page.path.startsWith("/r/user/") || $page.path.startsWith("/r/u/")) {
      // If the user tried to go to /r/user/username/m/multi, they probably
      // wanted /user/username/m/multi
      let newPath = $page.path.replace("/r", "");
      ahref(newPath, { replaceState: false });
    } else {
      ahref("/home", { replaceState: false });
    }
  }
</script>
