const Quotation = ({ value }) => {

  return (
    <figure className='quotation'>
      <blockquote>{value.quote}</blockquote>
      {value.author || value.source ? <figcaption>{value.author && value.author}{value.author && value.source ? `, ` : ''}{value.source && <cite>{value.url ? (<a href={value.url}>{value.source}</a>) : value.source}</cite>}</figcaption> : ''}
    </figure>
  )

}
export default Quotation