import fetchJsonp from "fetch-jsonp";
import he from "he";

export async function get_posts(url) {
  let res = await fetchJsonp(url, { jsonpCallback: "jsonp" });
  let data = await res.json();
  console.log("Fetched: ", data.data.children.length, data.data);

  let filtered = data.data.children.filter(item => filter(item));
  console.log("Filtered: ", filtered.length, filtered);

  let posts = await Promise.all(filtered.map(post => format(post)));

  console.log(posts);
  return { posts: posts, after: data.data.after };
}

export function is_image(item) {
  return item.data.url.endsWith(".jpg") || item.data.url.endsWith(".png");
}

export function filter(item) {
  return is_image(item) || is_video(item);
}

export function is_video(item) {
  if (!item.data.hasOwnProperty("preview")) return false;
  return (
    item.data.is_video ||
    item.data.preview.hasOwnProperty("reddit_video_preview")
  );
}

async function vidsrc(url, item) {
  if (url.includes("imgur.com/")) {
    let name = url.match(/imgur.com\/(.*)\..*/)[1];
    return {
      gif: `https://i.imgur.com/${name}.gif`,
      webm: `https://i.imgur.com/${name}.webm`,
      mp4: `https://i.imgur.com/${name}.mp4`
    };
  } else if (url.includes("gfycat.com/")) {
    let name = url.replace("https://gfycat.com/", "");
    // Sometimes gfycat urls are of the format "gfycat.com/videoid-extra-stuff". Remove anything after the first "-"
    name = name.split("-")[0];
    let res = await fetch(`https://api.gfycat.com/v1/gfycats/${name}`);
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
  }
}

export async function format(item) {
  if (Object.entries(item).length == 0) {
    return { title: "Loading ..", vidpreview: {} };
  }

  let vids = await vidsrc(item.data.url, item);

  let formatted = {
    title: item.data.title,
    permalink: item.data.permalink,
    is_video: is_video(item),
    is_image: is_image(item),
    url: item.data.url,
    preview: {
      vid: vids,
      img: {
        default: he.decode(
          item.data.preview.images[0].resolutions.slice(-1)[0].url
        ),
        hires: he.decode(item.data.preview.images[0].source.url)
      }
    }
  };
  //console.log("Returning", formatted);

  return formatted;
}
