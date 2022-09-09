import { parseISO, format } from 'date-fns'
import { client } from '../lib/sanityClient.js'
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(client)

export async function getSanityContent({ query, variables = {} }) {
  const { data } = await fetch(
    `${import.meta.env.PUBLIC_SANITY_GRAPHQL_URL}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    },
  ).then((response) => response.json());
  return data;
}

export function formatBlogPostDate(date) {
  const dateString = parseISO(date, 'YYYY/MM/Do')
  const formattedDateString = format(dateString, 'MMMM do, yyyy')
  return `${formattedDateString}`
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