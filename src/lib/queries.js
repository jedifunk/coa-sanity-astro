export const allPosts = `*[_type == 'article']{..., categories[] ->, country ->} | order(publishDate desc)`
export const RecentPosts = `*[_type == "article"] | order(_createdAt desc)[0...5]`

export const siteSettings = `*[_type == 'siteSettings']`