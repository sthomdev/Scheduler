import React from 'react';

const ResourceRow = ({ resource, availability }) => {
    return (
        <tr>
            <td>{resource.name}</td>
            {availability.map((isAvailable, index) => (
                <td key={index} className={isAvailable ? 'available' : 'unavailable'}>
                    {isAvailable ? 'Available' : 'Reserved'}
                </td>
            ))}
        </tr>
    );
};

export default ResourceRow;
