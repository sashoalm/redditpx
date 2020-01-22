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

    let filtered = data.data.children.filter(item => filter(item));
    console.log("Filtered: ", filtered.length, filtered);

    let posts = await Promise.all(filtered.map(post => format(post)));

    console.log("Formatted: ", posts.length, posts);

    return {
      posts,
      subreddit,
      after: data.data.after,
      res: { ok: true, res: res }
    };
  } catch (error) {
    console.log("[get_posts]: error");
    console.log(error);
    return {
      posts: [],
      after: "",
      subreddit: "",
      res: { ok: false, res: error }
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
  return item.kind == "t3";
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
async function imgsrc(url, item) {
  let imgs;
  try {
    imgs = {
      default: decode(item.data.preview.images[0].resolutions.slice(-1)[0].url),
      hires: decode(item.data.preview.images[0].source.url)
    };
  } catch {
    imgs = {
      default: url(item),
      hires: url(item)
    };
  }

  if (url.includes("imgur.com/a/")) {
    // Other cors proxies
    // https://gist.github.com/jimmywarting/ac1be6ea0297c16c477e17f8fbe51347
    //
    let corsproxy = "https://cors-anywhere.herokuapp.com";
    //let corsproxy2 = "https://yacdn.org/serve"

    let res = await fetch(`${corsproxy}/${url}/embed`);

    let html = await res.text();
    let images = [];

    let parser = new DOMParser();
    for (const node of parser
      .parseFromString(html, "text/html")
      .querySelectorAll(".thumb-title-embed")) {
      let img = imgur(node);

      images.push(img);
    }

    imgs["album"] = images;
  }
  return imgs;
}

function imgur(node) {
  let url = node.attributes["data-src"].value;
  let [a, b, domain, filename] = url.split("/");

  let [base, ext] = filename.split(".");

  // Remove the `s` from the base since s stands for "small"
  return `https://${domain}/${base.slice(0, -1)}.${ext}`;
}

async function vidsrc(url, item) {
  if (url.includes("imgur.com/")) {
    let name = url.match(/imgur.com\/(.*)\..*/)[1];
    return {
      gif: `https://i.imgur.com/${name}.gif`,
      //webm: `https://i.imgur.com/${name}.webm`,
      mp4: `https://i.imgur.com/${name}.mp4`
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
    let data = await res.json();
    return {
      webm: data.gfyItem.webmUrl,
      mp4: data.gfyItem.mp4Url,
      gif: data.gfyItem.gifUrl
    };
  } else if (url.includes("v.redd.it")) {
    return {
      mp4: item.data.media.reddit_video.fallback_url
    };
  } else if (url.includes("reddit.com/r/")) {
    return {
      mp4: item.data.preview.reddit_video_preview.fallback_url
    };
  } else if (url.includes("i.redd.it/")) {
    return {
      gif: decode(
        item.data.preview.images[0].variants.gif.resolutions.slice(-1)[0].url
      ),
      mp4: decode(
        item.data.preview.images[0].variants.mp4.resolutions.slice(-1)[0].url
      )
    };
  }
}

function url(item) {
  return item.data.url || item.data.link_url;
}

function decode(str) {
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
    preview: {
      vid: vids,
      img: imgs
    }
  };

  return formatted;
}
