import { PortableText } from '@portabletext/react'
import components from './Serializers'

const P2 = ({blocks}) => {

  return (
    <PortableText value={blocks} components={components} />
  )
}

export default P2