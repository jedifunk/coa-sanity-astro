import React from "react"

const VideoBlock = ({ value }) => {
  //const { src, poster, preoload, playsInline, muted, loop, controls, className, caption, autoplay, align } = props
  if (!value || !value.asset || !value.asset._id) { return (<pre>Oops, video</pre>) }

  return (
    <figure className="video-block">
      <video src={value.asset.url} controls></video>
      {value.caption && <figcaption>{value.caption}</figcaption>}
    </figure>
  )

}

export default VideoBlock