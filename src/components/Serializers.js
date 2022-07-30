import Break from './Breaks'
import Quotation from './Quotation'
import GalleryBlock from './GalleryBlock'
import Embed from './Embed'
import Image from './Image'
import VideoBlock from './VideoBlock'

const components = {
  types: {
    imageFull: Image,
    image: Image,
    video: VideoBlock,
    gallery: GalleryBlock,
    //googleMyMap: MapBlock,
    //instagramPost: InstagramBlock,
    //videoEmbed: VideoEmbedBlock,
    //mapbox: Mapbox,
    quotation: Quotation,
    break: Break,
    embed: Embed,
  }
}

export default components