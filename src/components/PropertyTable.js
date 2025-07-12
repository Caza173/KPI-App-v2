import React from 'react';

const PropertyTable = ({ properties, listings, onDelete, onUpdateClient }) => {
  return (
    <table className="table-auto border mt-2">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2 text-coral">Address</th>
          <th className="border p-2 text-coral">Client</th>
          <th className="border p-2 text-coral">Type</th>
          <th className="border p-2 text-coral">Price ($)</th>
          <th className="border p-2 text-coral">Commission ($)</th>
          <th className="border p-2 text-coral">Timestamp</th>
          <th className="border p-2 text-coral">Action</th>
        </tr>
      </thead>
      <tbody>
        {[...properties, ...listings].map((p, i) => (
          <tr key={i}>
            <td className="border p-2">{p.address}</td>
            <td className="border p-2">
              <input
                type="text"
                value={p.client || ''}
                onChange={e => onUpdateClient(i, e.target.value)}
                className="border p-1 w-full bg-gray-100 text-black"
              />
            </td>
            <td className="border p-2">{p.type}</td>
            <td className="border p-2">{p.price}</td>
            <td className="border p-2">{p.commission ? p.commission.toFixed(2) : '-'}</td>
            <td className="border p-2">{p.timestamp}</td>
            <td className="border p-2">
              <button
                onClick={() => onDelete(i)}
                className="bg-red-500 text-off-white p-1 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PropertyTable;