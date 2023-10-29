// Site wide
export const siteSettings = `*[_type == 'siteSettings']`
export const siteNav = `*[_type == 'siteSettings'][0]{siteNav{menuItems[]{name, page->{slug}}}}`

// Page & Posts
export const allPosts = `*[_type == 'article']{..., categories[] ->, country ->, content[]{..., markDefs[]{..., _type=='internalLink'=>{..., "slug": @.reference->slug}}, asset->, images[]{..., asset->}}} | order(publishDate desc)`
export const allPagesQuery = `*[_type == 'page']`
export const categoryList = `*[_type == "category"] | order(title asc) {title, slug}`

// Sidebar
export const allCountryPostsQuery = `*[_type == 'country']{..., 'relatedArticles': *[_type == 'article' && references(^._id)]{..., country ->, categories[] ->} | order(publishDate desc)}`
export const allCategoryPostsQuery = `*[_type == 'category']{..., 'relatedArticles': *[_type == 'article' && references(^._id)]{..., country ->, categories[] ->} | order(publishDate desc)}`
export const recentPosts = `*[_type == "article"] | order(_createdAt desc)[0...5] {title, slug}`

// Map related
export const countryList = `*[_type == "country"] | order(name asc) {name, menu, slug, isoA3}`
export const citiesQuery = `*[_type == 'city']{name, 'iso':country->isoA3, 'country':country->name, geometry}`
export const placesQuery = `*[_type == 'place']{name, geometry, description, website, address, placeType->{title, slug}}`