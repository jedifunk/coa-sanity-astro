export const allPosts = `*[_type == 'article']{..., categories[] ->, country ->} | order(publishDate desc)`
export const recentPosts = `*[_type == "article"] | order(_createdAt desc)[0...5] {title, slug}`
export const countryList = `*[_type == "country"] | order(name asc) {name, menu, slug}`
export const categoryList = `*[_type == "category"] | order(title asc) {title, slug}`

export const siteSettings = `*[_type == 'siteSettings']`