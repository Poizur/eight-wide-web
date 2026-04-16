import { defineDocumentType, makeSource } from 'contentlayer2/source-files'

export const DnaArticle = defineDocumentType(() => ({
  name: 'DnaArticle',
  filePathPattern: 'dna/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    series: { type: 'string', required: true },
    number: { type: 'number', required: true },
    brand: { type: 'string', required: true },
    year_real: { type: 'number' },
    set_number: { type: 'string', required: true },
    set_pieces: { type: 'number' },
    set_price_czk: { type: 'number' },
    set_status: { type: 'string', default: 'available' },
    hero_photo: { type: 'string', required: true },
    rating_shape: { type: 'number' },
    rating_detail: { type: 'number' },
    rating_build: { type: 'number' },
    rating_value: { type: 'number' },
    rating_display: { type: 'number' },
    read_time: { type: 'number' },
    excerpt: { type: 'string' },
    published: { type: 'date', required: true },
    draft: { type: 'boolean', default: false },
    // Icons/Technic fields
    icons_set_number: { type: 'string' },
    icons_lego_line: { type: 'string' },
    icons_set_pieces: { type: 'number' },
    icons_set_price_czk: { type: 'number' },
    icons_build_time: { type: 'string' },
    icons_difficulty: { type: 'string' },
    icons_rating_shape: { type: 'number' },
    icons_rating_detail: { type: 'number' },
    icons_rating_build: { type: 'number' },
    icons_rating_complexity: { type: 'number' },
    icons_rating_display: { type: 'number' },
    sc_for: { type: 'list', of: { type: 'string' } },
    icons_for: { type: 'list', of: { type: 'string' } },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/dna/${doc.slug}`,
    },
    rating_overall: {
      type: 'number',
      resolve: (doc) => {
        const {
          rating_shape = 0,
          rating_detail = 0,
          rating_build = 0,
          rating_value = 0,
          rating_display = 0,
        } = doc
        return +(
          rating_shape * 0.25 +
          rating_detail * 0.25 +
          rating_build * 0.2 +
          rating_value * 0.2 +
          rating_display * 0.1
        ).toFixed(1)
      },
    },
  },
}))

export const GeneraceArticle = defineDocumentType(() => ({
  name: 'GeneraceArticle',
  filePathPattern: 'generace/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    series: { type: 'string', required: true },
    brand: { type: 'string', required: true },
    set_number_new: { type: 'string', required: true },
    set_number_old: { type: 'string', required: true },
    hero_photo: { type: 'string', required: true },
    excerpt: { type: 'string' },
    published: { type: 'date', required: true },
    draft: { type: 'boolean', default: false },
    winner: { type: 'string' },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/generace/${doc.slug}`,
    },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [DnaArticle, GeneraceArticle],
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})
