import { getSanityImageUrl } from "../lib/Helpers"

const Image = ({value}) => {

  return (
    <>
    <figure className={`img-full`}>
      <button >
        <img src={getSanityImageUrl(value.asset)} />
        {value.caption && <figcaption>{value.caption}</figcaption>}
      </button>
    </figure>
    </>
  )
}

export default Image