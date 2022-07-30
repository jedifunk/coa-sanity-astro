import getVideoId from 'get-video-id'

const Embed = ({ value }) => {

  const link = value.url

  let iFrameStyles = {
    width: '100%',
    height: '100%',
    aspectRatio: '16/9'
  }

  function getEmbedCode(value) {
    const videoId = (value && value.url) ? getVideoId(value.url) : ''

    if (!videoId) {
      return <span />
    }

    switch (videoId.service) {
      case 'youtube': {
        return <iframe style={iFrameStyles} src={`https://www.youtube.com/embed/${videoId.id}?rel=0`} frameBorder="0" allowFullScreen />
      }

      case 'vimeo': {
        return (
          <iframe
            style={iFrameStyles}
            src={`https://player.vimeo.com/video/${videoId.id}`}
            width="640"
            frameBorder="0"
            webkitallowfullscreen
            mozallowfullscreen
            allowFullScreen
          />
        )
      }
      default: {
        return <span>Unsupported video service: {videoId.service}</span>
      }
    }
  }

  function chooseEmbedType(link) {
    if (link.includes('spotify')) {
      let spotifyItem = link.split('https://open.spotify.com/')[1].split('?si')[0]
      return (
        <figure className={`embed spotify-embed`}>
          <iframe src={`https://open.spotify.com/embed/${spotifyItem}?utm_source=generator&theme=0`} width="100%" height="380" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
          {value.caption && <figcaption>{value.caption}</figcaption>}
        </figure>
      )
    } else {
      getEmbedCode(value)
    }
  }

  return (
    chooseEmbedType(link)
  )
}

export default Embed