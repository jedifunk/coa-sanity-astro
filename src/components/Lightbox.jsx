import { useState } from "react"
import { useStore } from "@nanostores/react"
import { isLightboxOpen, photoIndex } from "../lib/helpers"
import Lightbox from "yet-another-react-lightbox"
import { sSpeed, getSanityImageUrl } from "../lib/Helpers"
import 'yet-another-react-lightbox/styles.css'
import Captions from "yet-another-react-lightbox/plugins/captions"
import "yet-another-react-lightbox/plugins/captions.css"

export default function LightboxJS ({ value }) {
  
  const slides = value.images.map((img) => ({
    src: getSanityImageUrl(img).url(),
    title: img.caption,
    description: `Camera: ${img.asset.metadata.exif.LensModel}, Aperture: f/${img.asset.metadata.exif.FNumber}, ISO: ${img.asset.metadata.exif.ISO}, Shutter Speed: ${sSpeed(img.asset.metadata.exif.ExposureTime)}`
  }))

  const $isLightboxOpen = useStore(isLightboxOpen)
  const $photoIndex = photoIndex.get()

  // Set State for Lightbox
  // const [photoIndex, setPhotoIndex] = useState(0)
  // const [isOpen, setIsOpen] = useState(false)

  return (
    <>
        {/* {value.images.map((img, index) => {
          const image = getSanityImageUrl(img).width(500).url()
          // setup onclick function to handle state change
          function updateOnClick() {
            setPhotoIndex(index)
            setIsOpen(true)
          }
        })} */}

      <Lightbox
        open={$isLightboxOpen}
        close={() => isLightboxOpen.set(!$isLightboxOpen)}
        slides={slides}
        index={$photoIndex}
        plugins={[Captions]}
        animation={{swipe: 0}}
        controller={{closeOnBackdropClick: true}}
      />

    </>
  )

}