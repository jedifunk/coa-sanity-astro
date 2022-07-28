const Quotation = ({ node }) => {

  return (
    <figure className='quotation'>
      <blockquote>{node.quote}</blockquote>
      {node.author || node.source ? <figcaption>{node.author && node.author}{node.author && node.source ? `, ` : ''}{node.source && <cite>{node.url ? (<a href={node.url}>{node.source}</a>) : node.source}</cite>}</figcaption> : ''}
    </figure>
  )

}
export default Quotation