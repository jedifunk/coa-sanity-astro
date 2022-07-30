export const allPosts = `*[_type == 'article']{..., categories[] ->, country ->, content[]{..., images[]{..., asset->}}} | order(publishDate desc)`
export const recentPosts = `*[_type == "article"] | order(_createdAt desc)[0...5] {title, slug}`
export const countryList = `*[_type == "country"] | order(name asc) {name, menu, slug}`
export const categoryList = `*[_type == "category"] | order(title asc) {title, slug}`
export const allPagesQuery = `*[_type == 'page']`
export const aboutPageQuery = `*[_type == 'page' && title == 'About']{..., content[]{..., asset->}}`

export const siteSettings = `*[_type == 'siteSettings']`