
import './map.scss'
import "leaflet/dist/leaflet.css";
import {MapContainer, TileLayer} from 'react-leaflet'
import Pin from '../pin/Pin';
function Map({items,zoom=16}){
  
  return (
<MapContainer
             center={
              items.length === 1
                ? [items[0].latitude, items[0].longitude]
                : [28.210631681874286, 83.98412824540198]
            }
              zoom={zoom}
              style={{height: '100%', width: '100%'}}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {items.map((item) => (
        <Pin item={item} key={item.id} />
      ))}
             
            </MapContainer>



  )
}

export default Map

