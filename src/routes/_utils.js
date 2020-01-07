import fetchJsonp from "fetch-jsonp";
import he from "he";

export async function get_posts(url) {
  let res = await fetchJsonp(url, { jsonpCallback: "jsonp" });
  let data = await res.json();
  console.log("Fetched", data.data);
  return data.data;
}

export function is_image(item) {
  return item.data.url.endsWith(".jpg") || item.data.url.endsWith(".png");
}

export function filter(item) {
  return is_image(item) || is_video(item);
}

export function is_video(item) {
  if (!item.data.hasOwnProperty("preview")) return false;
  return item.data.preview.hasOwnProperty("reddit_video_preview");
}

async function vidsrc(url) {
  console.log(url);
  if (url.includes("imgur.com/")) {
    let name = url.match(/imgur.com\/(.*)\..*/)[1];
    return {
      gif: `https://i.imgur.com/${name}.gif`,
      webm: `https://i.imgur.com/${name}.webm`,
      mp4: `https://i.imgur.com/${name}.mp4`
    };
  } else if (url.includes("gfycat.com/")) {
    let name = url.replace("https://gfycat.com/", "");
    let res = await fetch(`https://api.gfycat.com/v1/gfycats/${name}`);
    let data = await res.json();
    return {
      webm: data.gfyItem.webmUrl,
      mp4: data.gfyItem.mp4Url,
      gif: data.gfyItem.gifUrl
    };
  }
}

export function format(item) {
  if (Object.entries(item).length == 0) {
    return { title: "Loading ..", vidpreview: {} };
  }

  let vidpreview = vidsrc(item.data.url);

  let formatted = {
    title: item.data.title,
    is_video: is_video(item),
    is_image: is_image(item),
    url: item.data.url,
    vidpreview: vidpreview,
    imgpreview: he.decode(
      item.data.preview.images[0].resolutions.slice(-1)[0].url
    ),
    imghdpreview: he.decode(item.data.preview.images[0].source.url)
  };
  console.log("Returning", formatted);
  return formatted;
}
