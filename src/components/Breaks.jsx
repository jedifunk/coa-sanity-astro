const Break = ({ node }) => {

  if (node.horizontal === 'small break') {
    return <hr className='sm' />
  } else {
    return <hr />
  }

}
export default Break
