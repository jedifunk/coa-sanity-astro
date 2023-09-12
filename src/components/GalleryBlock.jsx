import { useState } from "react"
import Lightbox from "yet-another-react-lightbox"
import { sSpeed, getSanityImageUrlOldBuilder } from "../lib/helpers"
// import {BiExpandAlt} from 'react-icons/bi'
import 'yet-another-react-lightbox/styles.css'
import Captions from "yet-another-react-lightbox/plugins/captions"
import "yet-another-react-lightbox/plugins/captions.css"

export function GalleryBlock({ value }) {

  const cols = (value.columns != null) ? value.columns : 3

  const gClass = (value.gClass !== undefined) ? value.gClass : ''
  const cssParams = value.cssParams

  const slides = value.images.map((img) => ({
    src: getSanityImageUrlOldBuilder(img).auto('format').quality(100).url(),
    title: img.caption,
    description: `${img?.asset?.metadata?.exif ? `Camera: ${img?.asset?.metadata?.exif?.LensModel}, ISO: ${img?.asset?.metadata?.exif?.ISO}, Shutter Speed: ${sSpeed(img?.asset?.metadata?.exif?.ExposureTime)}` : ``}`
  }))

  // Set State for Lightbox
  const [photoIndex, setPhotoIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
    {cssParams !== undefined && <style>{`${cssParams}`}</style>}
    <div className={`blocks-gallery-grid columns-${cols} ${gClass}`}>
      {value.images.map((img, index) => {
        //const image = getSanityImageUrl(img).url()

        // setup onclick function to handle state change
        function updateOnClick() {
          setPhotoIndex(index)
          setIsOpen(true)
        }
        
        return (
          <figure key={index} className="blocks-gallery-item">
            <button onClick={updateOnClick} className="gal-btn">
              {/* <BiExpandAlt className='enlarge'/> */}
              <img src={getSanityImageUrlOldBuilder(img).width(750).auto('format').url()} loading="lazy" alt={img.alt}/>
              {img.caption && <figcaption>{img.caption}</figcaption>}
            </button>
          </figure>
        )
      })}
    </div>

    <Lightbox
      open={isOpen}
      close={() => setIsOpen(false)}
      slides={slides}
      index={photoIndex}
      plugins={[Captions]}
      animation={{swipe: 0}}
      controller={{closeOnBackdropClick: true}}
    />
    </>
  )
}