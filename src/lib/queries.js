export const allPosts = `*[_type == 'article']{..., categories[] ->, country ->, content[]{..., markDefs[]{..., _type=='internalLink'=>{..., "slug": @.reference->slug}}, asset->, images[]{..., asset->}}} | order(publishDate desc)`
export const allPagesQuery = `*[_type == 'page']`
export const allCountryPostsQuery = `*[_type == 'country']{..., 'relatedArticles': *[_type == 'article' && references(^._id)]{..., country ->, categories[] ->} | order(publishDate desc)}`
export const allCategoryPostsQuery = `*[_type == 'category']{..., 'relatedArticles': *[_type == 'article' && references(^._id)]{..., country ->, categories[] ->} | order(publishDate desc)}`

export const recentPosts = `*[_type == "article"] | order(_createdAt desc)[0...5] {title, slug}`
export const countryList = `*[_type == "country"] | order(name asc) {name, menu, slug}`
export const categoryList = `*[_type == "category"] | order(title asc) {title, slug}`

export const siteSettings = `*[_type == 'siteSettings']`
export const siteNav = `*[_type == 'siteSettings'][0]{siteNav{menuItems[]{name, page->{slug}}}}`