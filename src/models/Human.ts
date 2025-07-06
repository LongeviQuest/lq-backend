export interface Human {
  ageInYears?: number;
  _id: Oid;
  id: NumberInt;
  date: string;
  date_gmt: string;
  guid: Rendered;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: Rendered;
  content: Content;
  parent: NumberInt;
  template: string;
  yoast_head: string;
  yoast_head_json: YoastHeadJson;
  acf: ACF;
  gallery_section: GalleryItem[];
  sc_validated: boolean;
  validation_information: ValidationInformation;
  attribution: boolean;
  _links: Links;
  time_components?: TimeComponents;
  total_milliseconds?: number;
}

interface TimeComponents {
  years: number;
  days: number;
}
interface Oid {
  $oid: string;
}
interface NumberInt {
  $numberInt: string;
}
interface Rendered {
  rendered: string;
}
interface Content {
  rendered: string;
  protected: boolean;
}
interface YoastHeadJson {
  title: string;
  description: string;
  robots: Robots;
  canonical: string;
  og_locale: string;
  og_type: string;
  og_title: string;
  og_description: string;
  og_url: string;
  og_site_name: string;
  article_modified_time: string;
  twitter_card: string;
  twitter_misc: TwitterMisc;
  schema: Schema;
}
interface Robots {
  index: string;
  follow: string;
  max_snippet: string;
  max_image_preview: string;
  max_video_preview: string;
}
interface TwitterMisc {
  'Est. reading time': string;
}
interface Schema {
  '@context': string;
  '@graph': Graph[];
}
interface Graph {
  '@type': string;
  '@id': string;
  url?: string;
  name?: string;
  isPartOf?: { '@id': string };
  datePublished?: string;
  dateModified?: string;
  description?: string;
  breadcrumb?: { '@id': string };
  inLanguage?: string;
  position?: NumberInt;
  itemListElement?: ListItem[];
  target?: string[];
  publisher?: { '@id': string };
  logo?: ImageObject;
  image?: { '@id': string };
}
interface ListItem {
  '@type': string;
  position: NumberInt;
  name?: string;
  item?: string;
}
interface ImageObject {
  '@type': string;
  inLanguage?: string;
  '@id'?: string;
  url?: string;
  contentUrl?: string;
  width?: string;
  height?: string;
  caption?: string;
}
interface TimeZoneInfo {
  timeZoneId: string;
}
export interface TimeZone {
  birth_place?: TimeZoneInfo;
  death_place?: TimeZoneInfo;
  residence?: TimeZoneInfo;
}
interface ACF {
  time_zones?: TimeZone;
  personal_information: PersonalInformation;
  biography: Paragraph[];
  recognition: Paragraph[];
  gallery_section: GalleryItem[];
  sc_validated: boolean;
  validation_information?: ValidationInformation;
  attribution: boolean;
}
export interface PersonalInformation {
  nationality: Term;
  name: string;
  lastname: string;
  birth: Date | string;
  birth_place: Place;
  residence: Place;
  photo: string;
  sex: Term;
  race?: any;
  is_dead: boolean;
  date_of_death: Date | string | null;
  death_place: Place;
  ageInMilliseconds: number;
  ageInYears: number;
  taxonomy_MilitaryService: string;
  taxonomy_Marriage: string;
  taxonomy_Issue: string;
  taxonomy_Family: string;
  taxonomy_SelfExpression: string;
  taxonomy_HabitVices: string;
  taxonomy_CauseOfDeath: string;
}
interface Term {
  term_id: NumberInt;
  name: string;
  slug: string;
  term_group: NumberInt;
  term_taxonomy_id: NumberInt;
  taxonomy: string;
  description: string;
  parent: NumberInt;
  count: NumberInt;
  filter: string;
}
interface Place {
  country: Term;
  city: string;
}
interface Paragraph {
  paragraph: string;
}
interface GalleryItem {
  ID: NumberInt;
  id: NumberInt;
  title: string;
  filename: string;
  filesize: NumberInt;
  url: string;
  link: string;
  alt: string;
  author: string;
  description: string;
  caption: string;
  name: string;
  status: string;
  uploaded_to: NumberInt;
  date: string;
  modified: string;
  menu_order: NumberInt;
  mime_type: string;
  type: string;
  subtype: string;
  icon: string;
  width: NumberInt;
  height: NumberInt;
  sizes: Sizes;
}
interface Sizes {
  thumbnail: string;
  'thumbnail-width': NumberInt;
  'thumbnail-height': NumberInt;
  medium: string;
  'medium-width': NumberInt;
  'medium-height': NumberInt;
  medium_large: string;
  'medium_large-width': NumberInt;
  'medium_large-height': NumberInt;
  large: string;
  'large-width': NumberInt;
  'large-height': NumberInt;
  '1536x1536': string;
  '1536x1536-width': NumberInt;
  '1536x1536-height': NumberInt;
  '2048x2048': string;
  '2048x2048-width': NumberInt;
  '2048x2048-height': NumberInt;
  woocommerce_thumbnail: string;
  'woocommerce_thumbnail-width': NumberInt;
  'woocommerce_thumbnail-height': NumberInt;
  woocommerce_single: string;
  'woocommerce_single-width': NumberInt;
  'woocommerce_single-height': NumberInt;
  woocommerce_gallery_thumbnail: string;
  'woocommerce_gallery_thumbnail-width': NumberInt;
  'woocommerce_gallery_thumbnail-height': NumberInt;
}
interface ValidationInformation {
  researcher: Validator[];
  validation_date: { $date: { $numberLong: string } };
}
interface Validator {
  validator: boolean;
}
interface Links {
  self: Href[];
  collection: Href[];
  about: Href[];
  'wp:attachment': Href[];
  'wp:term': Href[];
  curies: Curies[];
}
interface Href {
  href: string;
}
interface Curies {
  name: string;
  href: string;
  templated: boolean;
}
