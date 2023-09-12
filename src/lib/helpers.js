import { parseISO, format, fromUnixTime } from 'date-fns'
import { useSanityClient } from '@sanity/astro'
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(useSanityClient())

// Included to get galleries to work until new @sanity/astro fix for images is out
import {createClient} from '@sanity/client'
const config = {
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  token: import.meta.env.PUBLIC_SANITY_READ_TOKEN,
  apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION,
  useCdn: false,
}
const oldClient = createClient(config)
const oldBuilder = imageUrlBuilder(oldClient)
export function getSanityImageUrlOldBuilder(source) {
  return oldBuilder.image(source)
}

// export async function getSanityContent({ query, variables = {} }) {
//   const { data } = await fetch(
//     `${import.meta.env.PUBLIC_SANITY_URL}`,
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         query,
//         variables,
//       }),
//     },
//   ).then((response) => response.json());
//   return data;
// }

export function formatBlogPostDate(date) {
  const dateString = parseISO(date, 'YYYY/MM/Do')
  const formattedDateString = format(dateString, 'MMMM do, yyyy')
  return `${formattedDateString}`
}
export function formatUnixDate(date) {
  const dateString = fromUnixTime(date)
  const notUnix = format(dateString, 'MMMM do, yyyy')
  return `${notUnix}`
}

export function getSanityImageUrl(source) {
  return builder.image(source)
}

// Shutter Speed conversion function
export function sSpeed(d) {
  if (d >= 1) {
    return Math.round(d) + "s"
  }
  var df = 1,
    top = 1,
    bot = 1
  var tol = 1e-8 // seems to allow for d > 1e-4
  while (df !== d && Math.abs(df - d) > tol) {
    if (df < d) {
      top += 1
    } else {
      bot += 1
      top = parseInt(d * bot, 10)
    }
    df = top / bot
  }
  if (top > 1) {
    bot = Math.round(bot / top)
    top = 1
  }
  if (bot <= 1) {
    return "1s"
  }
  return top + "/" + bot + "s"
}