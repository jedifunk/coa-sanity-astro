import { parseISO, format, fromUnixTime } from 'date-fns'
import { client } from '../lib/sanityClient.js'
import imageUrlBuilder from '@sanity/image-url'
import EleventyFetch from '@11ty/eleventy-fetch'

const builder = imageUrlBuilder(client)

export async function getSanityContent({ query, variables = {} }) {
  const { data } = await fetch(
    `${import.meta.env.PUBLIC_SANITY_URL}`,
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

export function mapButtons(text) {
  var output = text
    .replace(/-/g, ' / ')
  
    const words = output.split(" ");

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }

  var final = words.join(" ");

  return final
}

// use EleventyFetch to cache query results
export async function cacheFetch(query) {
  return EleventyFetch(query, {
    duration: '1d',
    type: 'json',
  })
}