import React from 'react';

export default function(props) {
    return (
        <video width={props.data.images.original.width} height={props.data.images.original.height} poster={props.data.images.original.webp} autoplay>
          <source src={props.data.images.original.mp4} type="video/mp4" />
        </video>
    )
};
