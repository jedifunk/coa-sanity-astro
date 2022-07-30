const Break = ({ value }) => {

  if (value.horizontal === 'small break') {
    return <hr className='sm' />
  } else {
    return <hr />
  }

}
export default Break
