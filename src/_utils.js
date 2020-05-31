import fetchJsonp from "fetch-jsonp";

export function queryp(query) {
  return Object.entries(query)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");
}

export async function get_posts(url) {
  try {
    let res = await fetchJsonp(url, { jsonpCallback: "jsonp", timeout: 5000 });
    let data = await res.json();
    console.log("Fetched: ", data.data.children.length, data.data);
    let subreddit = data.data.children[0].data.subreddit;

    let filtered = data.data.children.filter((item) => filter(item));
    console.log("Filtered: ", filtered.length, filtered);

    let posts = await Promise.all(filtered.map((post) => format(post)));

    console.log("Formatted: ", posts.length, posts);

    return {
      posts,
      subreddit,
      after: data.data.after,
      res: { ok: true, res: res },
    };
  } catch (error) {
    console.log("[get_posts]: error");
    console.log(error);
    return {
      posts: [],
      after: "",
      subreddit: "",
      res: { ok: false, res: error },
    };
  }
}

function is_album(imgs) {
  return imgs.hasOwnProperty("album");
}

function is_image(item) {
  return (
    url(item).endsWith(".jpg") ||
    url(item).endsWith(".png") ||
    url(item).includes("imgur.com/a/")
  );
}

function is_post(item) {
  // t3
  // t1 = to support /u/jeffjose
  return item.kind == "t3" || item.kind == "t1";
}

export function filter(item) {
  return is_post(item) && (is_image(item) || is_video(item));
}

export function is_video(item) {
  if (!item.data.hasOwnProperty("preview")) return false;
  return (
    item.data.is_video ||
    item.data.preview.hasOwnProperty("reddit_video_preview") ||
    (url(item).startsWith("https://i.redd.it") && url(item).endsWith(".gif"))
  );
}

export function get_dims(item) {
  let dims = { height: "", width: "" };

  if (is_image(item)) {
    dims = {
      height: item.data.preview.images[0].source.height,
      width: item.data.preview.images[0].source.width,
    };
  } else if (is_video(item)) {
    try {
      dims = {
        height: item.data.preview.reddit_video_preview.height,
        width: item.data.preview.reddit_video_preview.width,
      };
    } catch {
      // if you cant get the dims from the video, pick it up from the preview image
      dims = {
        height: item.data.preview.images[0].source.height,
        width: item.data.preview.images[0].source.width,
      };
    }
  }

  return dims;
}

async function imgsrc(u, item) {
  let imgs;
  try {
    imgs = {
      default: decode(item.data.preview.images[0].resolutions.slice(-1)[0].url),
      hires: decode(item.data.preview.images[0].source.url),
    };
  } catch {
    imgs = {
      default: url(item),
      hires: url(item),
    };
  }

  //  if (u.includes("imgur.com/a/")) {
  //    //
  //    //
  //
  //    // Other cors proxies
  //    // https://gist.github.com/jimmywarting/ac1be6ea0297c16c477e17f8fbe51347
  //    //
  //    try {
  //      //let corsproxy = "https://cors-anywhere.herokuapp.com/";
  //      let corsproxy = "https://cors-anywhere.glitch.me/";
  //      let backupproxies = [
  //        "https://redditpx-cors-2.glitch.me/",
  //        "https://redditpx-cors.glitch.me/",
  //      ];
  //
  //      let res;
  //      try {
  //        res = await fetch(`${corsproxy}${u}/embed`, {
  //          headers: { origin: "redditpx" },
  //        });
  //      } catch (error) {
  //        corsproxy = backupproxies[randint(0, backupproxies.length - 1)];
  //
  //        res = await fetch(`${corsproxy}${u}/embed`, {
  //          headers: { origin: "redditpx" },
  //        });
  //      }
  //
  //      let html = await res.text();
  //      let images = [];
  //
  //      imgs["album"] = extractAlbumInfoNode(html);
  //    } catch (error) {}
  //  }
  return imgs;
}

function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function extractAlbumInfoNode(html) {
  let parser = new DOMParser();
  let scripts = parser
    .parseFromString(html, "text/html")
    .querySelectorAll('script[type="text/javascript"]');

  let node = Array.from(scripts).filter((node) =>
    node.text.includes("album.generalInit()")
  )[0];

  // Extract JSON embedded inside js code
  //
  // 1. Remove extra spaces
  // 2. Remove newlines
  // 3. Grab everything inbetween `,album: and ,images:`
  // 4. Convert to JSON
  //
  let info = JSON.parse(
    node.text
      .replace(/ /g, "")
      .replace(/\n/g, "")
      .match(/,album:(.*),images:/)[1]
  );

  let album = [];
  for (const _i of info.album_images.images) {
    let i = {
      // Force mp4 for imgur gifs
      hires: `https://i.imgur.com/${_i.hash}${_i.ext}`.replace(".gif", ".mp4"),
      default: `https://i.imgur.com/${_i.hash}h${_i.ext}`.replace(
        ".gif",
        ".mp4"
      ),
      is_image: !_i.prefer_video,
      is_video: _i.prefer_video,
    };

    album.push(i);
  }
  return album;
}

async function vidsrc(url, item) {
  if (url.includes("imgur.com/")) {
    let name = url.match(/imgur.com\/(.*)\..*/)[1];
    return {
      gif: `https://i.imgur.com/${name}.gif`,
      //webm: `https://i.imgur.com/${name}.webm`,
      mp4: `https://i.imgur.com/${name}.mp4`,
    };
  } else if (url.includes("gfycat.com/")) {
    let name = url.match(/gfycat.com\/(.*)/)[1];

    // Sometimes gfycat urls are of the format "gfycat.com/videoid-extra-stuff". Remove anything after the first "-"
    name = name.split("-")[0].replace(".gif", "");

    // Sometimes gfycat urls are of the format "gfycat.com/gifs/detail/videoid".
    name = name.replace("gifs/detail/", "");

    let res = await fetch(`https://api.gfycat.com/v1/gfycats/${name}`, {
      //mode: "no-cors"
    });
    try {
      let data = await res.json();
      return {
        webm: data.gfyItem.webmUrl,
        mp4: data.gfyItem.mp4Url,
        gif: data.gfyItem.gifUrl,
      };
    } catch {
      // If gfycat.com fails, try redgifs.com
      // https://www.reddit.com/r/redditp/comments/gpwo5u/why_do_so_many_gifs_and_video_come_up_blank_black/
      try {
        let res = await fetch(`https://api.redgifs.com/v1/gfycats/${name}`, {
          //mode: "no-cors"
        });
        let data = await res.json();
        return {
          webm: data.gfyItem.webmUrl,
          mp4: data.gfyItem.mp4Url,
          gif: data.gfyItem.gifUrl,
        };
      } catch {
        return {};
      }
      return {};
    }
  } else if (url.includes("v.redd.it")) {
    return {
      mp4: item.data.media.reddit_video.fallback_url,
    };
  } else if (url.includes("reddit.com/r/")) {
    return {
      mp4: item.data.preview.reddit_video_preview.fallback_url,
    };
  } else if (url.includes("i.redd.it/")) {
    let gif, mp4;
    try {
      gif = item.data.preview.images[0].variants.gif.resolutions.slice(-1)[0]
        .url;
      mp4 = item.data.preview.images[0].variants.mp4.resolutions.slice(-1)[0]
        .url;
    } catch (error) {
      gif = item.data.preview.images[0].variants.gif.source.url;
      mp4 = item.data.preview.images[0].variants.mp4.source.url;
    }

    return { gif: decode(gif), mp4: decode(mp4) };
  } else {
    return {
      mp4: item.data.preview.reddit_video_preview.fallback_url,
    };
  }
}

function url(item) {
  return item.data.url || item.data.link_url;
}

function decode(str) {
  if (str === undefined) return undefined;
  let parser = new DOMParser();
  return parser.parseFromString(`<!doctype html><body>${str}`, "text/html").body
    .textContent;
}

function title(item) {
  return decode(item.data.title) || decode(item.data.link_title);
}

function thumbnail(item) {
  let thumbnail = item.data.thumbnail;
  if (thumbnail == "spoiler" || thumbnail == "nsfw") {
    return decode(item.data.preview.images[0].resolutions[0].url);
  } else {
    return thumbnail;
  }
}

export async function format(item) {
  if (Object.entries(item).length == 0) {
    return { title: "Loading ..", vidpreview: {} };
  }

  let imgs = await imgsrc(url(item), item);
  let vids = is_video(item) ? await vidsrc(url(item), item) : {};

  let formatted = {
    id: item.data.id,
    title: title(item),
    thumbnail: thumbnail(item),
    subreddit: item.data.subreddit,
    subredditp: item.data.subreddit_name_prefixed,
    permalink: item.data.permalink,
    over18: item.data.over_18,
    is_video: is_video(item),
    is_image: is_image(item),
    is_album: is_album(imgs), // based on `imgs`
    favorite: false,
    url: url(item),
    dims: get_dims(item),
    preview: {
      vid: vids,
      img: imgs,
    },
  };

  return formatted;
}
