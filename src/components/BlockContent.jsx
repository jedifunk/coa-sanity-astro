import BlockContent from '@sanity/block-content-to-react'
import serializers from './Serializers'

const PortableText = ({blocks}) => (
  <BlockContent blocks={blocks} serializers={serializers} />
)

export default PortableText