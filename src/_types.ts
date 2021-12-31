/* Reddit Response */

interface MediaEmbed {}

interface RedditVideo {
  bitrate_kbps: number;
  fallback_url: string;
  height: number;
  width: number;
  scrubber_media_url: string;
  dash_url: string;
  duration: number;
  hls_url: string;
  is_gif: boolean;
  transcoding_status: string;
}

interface SecureMedia {
  reddit_video: RedditVideo;
}

interface SecureMediaEmbed {}

interface Gildings {
  gid_1: number;
}

interface Source {
  url: string;
  width: number;
  height: number;
}

interface Resolution {
  url: string;
  width: number;
  height: number;
}

interface Variants {}

interface Image {
  source: Source;
  resolutions: Resolution[];
  variants: Variants;
  id: string;
}

interface RedditPreview {
  images: Image[];
  enabled: boolean;
}

interface ResizedIcon {
  url: string;
  width: number;
  height: number;
}

interface ResizedStaticIcon {
  url: string;
  width: number;
  height: number;
}

interface AllAwarding {
  giver_coin_reward?: any;
  subreddit_id?: any;
  is_new: boolean;
  days_of_drip_extension: number;
  coin_price: number;
  id: string;
  penny_donate?: any;
  award_sub_type: string;
  coin_reward: number;
  icon_url: string;
  days_of_premium: number;
  tiers_by_required_awardings?: any;
  resized_icons: ResizedIcon[];
  icon_width: number;
  static_icon_width: number;
  start_date?: any;
  is_enabled: boolean;
  awardings_required_to_grant_benefits?: any;
  description: string;
  end_date?: any;
  subreddit_coin_reward: number;
  count: number;
  static_icon_height: number;
  name: string;
  resized_static_icons: ResizedStaticIcon[];
  icon_format?: any;
  icon_height: number;
  penny_price?: any;
  award_type: string;
  static_icon_url: string;
}

interface RedditVideo2 {
  bitrate_kbps: number;
  fallback_url: string;
  height: number;
  width: number;
  scrubber_media_url: string;
  dash_url: string;
  duration: number;
  hls_url: string;
  is_gif: boolean;
  transcoding_status: string;
}

interface Media {
  reddit_video: RedditVideo2;
}

interface Data {
  approved_at_utc?: any;
  subreddit: string;
  selftext: string;
  author_fullname: string;
  saved: boolean;
  mod_reason_title?: any;
  gilded: number;
  clicked: boolean;
  title: string;
  link_flair_richtext: any[];
  subreddit_name_prefixed: string;
  hidden: boolean;
  pwls: number;
  link_flair_css_class: string;
  downs: number;
  thumbnail_height: number;
  top_awarded_type?: any;
  hide_score: boolean;
  name: string;
  quarantine: boolean;
  link_flair_text_color: string;
  upvote_ratio: number;
  author_flair_background_color?: any;
  ups: number;
  total_awards_received: number;
  media_embed: MediaEmbed;
  thumbnail_width: number;
  author_flair_template_id?: any;
  is_original_content: boolean;
  user_reports: any[];
  secure_media: SecureMedia;
  is_reddit_media_domain: boolean;
  is_meta: boolean;
  category?: any;
  secure_media_embed: SecureMediaEmbed;
  link_flair_text: string;
  can_mod_post: boolean;
  score: number;
  approved_by?: any;
  is_created_from_ads_ui: boolean;
  author_premium: boolean;
  thumbnail: string;
  edited: boolean;
  author_flair_css_class?: any;
  author_flair_richtext: any[];
  gildings: Gildings;
  post_hint: string;
  content_categories?: any;
  is_self: boolean;
  subreddit_type: string;
  created: number;
  link_flair_type: string;
  wls: number;
  removed_by_category?: any;
  banned_by?: any;
  author_flair_type: string;
  domain: string;
  allow_live_comments: boolean;
  selftext_html?: any;
  likes?: any;
  suggested_sort?: any;
  banned_at_utc?: any;
  url_overridden_by_dest: string;
  view_count?: any;
  archived: boolean;
  no_follow: boolean;
  is_crosspostable: boolean;
  pinned: boolean;
  over_18: boolean;
  preview: RedditPreview;
  all_awardings: AllAwarding[];
  awarders: any[];
  media_only: boolean;
  link_flair_template_id: string;
  can_gild: boolean;
  spoiler: boolean;
  locked: boolean;
  author_flair_text?: any;
  treatment_tags: any[];
  visited: boolean;
  removed_by?: any;
  mod_note?: any;
  distinguished?: any;
  subreddit_id: string;
  author_is_blocked: boolean;
  mod_reason_by?: any;
  num_reports?: any;
  removal_reason?: any;
  link_flair_background_color: string;
  id: string;
  is_robot_indexable: boolean;
  report_reasons?: any;
  author: string;
  discussion_type?: any;
  num_comments: number;
  send_replies: boolean;
  whitelist_status: string;
  contest_mode: boolean;
  mod_reports: any[];
  author_patreon_flair: boolean;
  author_flair_text_color?: any;
  permalink: string;
  parent_whitelist_status: string;
  stickied: boolean;
  url: string;
  subreddit_subscribers: number;
  created_utc: number;
  num_crossposts: number;
  media: Media;
  is_video: boolean;
}

export interface RedditItem {
  kind: string;
  data: Data;
}

/* Formatted */

export interface Dims {
  height: number;
  width: number;
}

export type Vid =
  | {
      // imgur.com
      gif: string;
      mp4: string;
      lores: string;
    }
  | {
      // redgifs.com / gfycat.com
      gif: string;
      mp4: string;
      webm: string;
      lores: string;
    }
  | {
      // v.redd.it, reddit.com/r/
      mp4: string;
      lores: string;
    }
  | {
      // i.reddit.com
      gif: string;
      mp4: string;
      lores: string;
    }
  | {
      // default
      mp4: string;
      lores: string;
    }
  | {};

export interface Img {
  default: string;
  hires: string;
}

export interface Preview {
  vid: Vid;
  img: Img;
}

export type FormattedItem =
  | {
      id: string;
      author: string;
      authorp: string;
      title: string;
      thumbnail: string;
      subreddit: string;
      subredditp: string;
      permalink: string;
      over18: boolean;
      is_video: boolean;
      is_image: boolean;
      is_album: boolean;
      favorite: boolean;
      url: string;
      dims: Dims;
      orientation: Orientation;
      preview: Preview;
    }
  | {
      url: undefined;
      title: string;
      vidpreview: Object;
    };

export enum Orientation {
  Normal = "normal",
  Portrait = "portrait",
  Landscape = "landscape"
}
