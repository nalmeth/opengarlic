import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Alert, Snackbar, Stack } from '@mui/material';

const ToastContext = createContext(null);

/**
 * Wrap the app in this once, near the root, so any component can call
 * useToast() without needing the toast state passed down as a prop.
 */
export const ToastProvider = ({ children }) => {
	const [toasts, setToasts] = useState([]);
	const nextId = useRef(0);

	/**
	 * Show a toast notification.
	 * @param {string} message Text to display
	 * @param {'error'|'warning'|'info'|'success'} [severity='info']
	 * @param {number} [autoHideDuration=5000] ms before auto-dismissing
	 */
	const showToast = useCallback((message, severity = 'info', autoHideDuration = 5000) => {
		const id = nextId.current++;
		setToasts(prevToasts => [...prevToasts, { id, message, severity, autoHideDuration }]);
	}, []);

	const dismissToast = useCallback((id) => {
		setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<Stack
				spacing={1}
				sx={{
					position: 'fixed',
					bottom: 16,
					left: '50%',
					transform: 'translateX(-50%)',
					zIndex: 2000
				}}
			>
				{toasts.map(toast => (
					<Snackbar
						key={toast.id}
						open
						autoHideDuration={toast.autoHideDuration}
						onClose={() => dismissToast(toast.id)}
						sx={{ position: 'static' }}
					>
						<Alert
							onClose={() => dismissToast(toast.id)}
							severity={toast.severity}
							variant="filled"
							sx={{ width: '100%' }}
						>
							{toast.message}
						</Alert>
					</Snackbar>
				))}
			</Stack>
		</ToastContext.Provider>
	)
}

/**
 * @returns {{ showToast: (message: string, severity?: string, autoHideDuration?: number) => void }}
 */
export const useToast = () => {
	const context = useContext(ToastContext);
	if(!context) {
		throw new Error('useToast() must be called from within a <ToastProvider>');
	}
	return context;
}
