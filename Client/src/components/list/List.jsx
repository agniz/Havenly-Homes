import './list.scss'
import Card from "../Card/Card"
import { useState } from 'react'

function List({posts}){
  const [items, setItems] = useState(posts);

  const handleDelete = (deletedId) => {
    setItems(items.filter(item => item.id !== deletedId));
  };

  return (
    <div className='list'>
      {items.map(item=>(
        <Card key={item.id} item={item} onDelete={handleDelete}/>
      ))}
    </div>
  )
}

export default List