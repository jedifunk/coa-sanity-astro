import {useState} from "react"
import Lightbox from "yet-another-react-lightbox"
import { sSpeed, getSanityImageUrl } from "../lib/Helpers"
import 'yet-another-react-lightbox/styles.css'
import Captions from "yet-another-react-lightbox/plugins/captions"
import "yet-another-react-lightbox/plugins/captions.css"

const GalleryBlock = ({ value }) => {

  const cols = (value.columns != null) ? value.columns : 3

  const slides = value.images.map((img) => ({
    src: getSanityImageUrl(img).url(),
    title: img.caption,
    description: `Camera: ${img.asset.metadata.exif.LensModel}, Aperture: f/${img.asset.metadata.exif.FNumber}, ISO: ${img.asset.metadata.exif.ISO}, Shutter Speed: ${sSpeed(img.asset.metadata.exif.ExposureTime)}`
  }))

  // Set State for Lightbox
  const [photoIndex, setPhotoIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
    <div className={`blocks-gallery-grid columns-${cols}`}>
        {value.images.map((img, index) => {
          const image = getSanityImageUrl(img).width(500).url()
          // setup onclick function to handle state change
          function updateOnClick() {
            setPhotoIndex(index)
            setIsOpen(true)
          }
          
          return (
            <figure key={index} className="blocks-gallery-item">
              <button onClick={updateOnClick}>
                {/* <BiExpandAlt className='enlarge'/> */}
                <img src={getSanityImageUrl(img).width(500).url()} loading="lazy" width={`500`} height={`667`} alt={img.alt}/>
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
      />

    </>
  )

}

export default GalleryBlock