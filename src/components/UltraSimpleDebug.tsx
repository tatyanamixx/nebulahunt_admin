import React from 'react';

export default function UltraSimpleDebug() {
	console.log('🔴 UltraSimpleDebug: Component rendered');

	return (
		<div
			style={{
				position: 'fixed',
				top: '10px',
				left: '10px',
				zIndex: 10000,
				backgroundColor: 'red',
				color: 'white',
				padding: '15px',
				borderRadius: '8px',
				border: '3px solid white',
				fontSize: '16px',
				fontWeight: 'bold',
				boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
			}}>
			🔴 ULTRA DEBUG
		</div>
	);
}
