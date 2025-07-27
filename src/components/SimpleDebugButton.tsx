import React from 'react';

export default function SimpleDebugButton() {
	console.log('🔴 SimpleDebugButton: Component rendered');

	return (
		<div
			style={{
				position: 'fixed',
				bottom: '20px',
				right: '20px',
				zIndex: 9999,
				backgroundColor: 'red',
				color: 'white',
				padding: '10px',
				borderRadius: '5px',
				border: '2px solid white',
				fontSize: '14px',
				fontWeight: 'bold',
			}}>
			🔴 DEBUG BUTTON
		</div>
	);
}
