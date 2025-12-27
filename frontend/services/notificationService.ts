import toast from 'react-hot-toast';

/**
 * Toast notification service for user feedback
 * Replaces browser alert() with better UX
 */
export const notificationService = {
    /**
     * Show success message
     */
    success: (message: string) => {
        toast.success(message, {
            duration: 4000,
            position: 'top-right',
            style: {
                background: '#10B981',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
            },
        });
    },

    /**
     * Show error message
     */
    error: (message: string) => {
        toast.error(message, {
            duration: 5000,
            position: 'top-right',
            style: {
                background: '#EF4444',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
            },
        });
    },

    /**
     * Show info message
     */
    info: (message: string) => {
        toast(message, {
            duration: 4000,
            position: 'top-right',
            icon: 'ℹ️',
            style: {
                background: '#3B82F6',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
            },
        });
    },

    /**
     * Show warning message
     */
    warning: (message: string) => {
        toast(message, {
            duration: 4500,
            position: 'top-right',
            icon: '⚠️',
            style: {
                background: '#F59E0B',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
            },
        });
    },

    /**
     * Show loading message
     */
    loading: (message: string) => {
        return toast.loading(message, {
            position: 'top-right',
        });
    },

    /**
     * Dismiss a specific toast
     */
    dismiss: (toastId: string) => {
        toast.dismiss(toastId);
    },

    /**
     * Dismiss all toasts
     */
    dismissAll: () => {
        toast.dismiss();
    },

    /**
     * Show promise-based toast (for async operations)
     */
    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return toast.promise(
            promise,
            {
                loading: messages.loading,
                success: messages.success,
                error: messages.error,
            },
            {
                position: 'top-right',
            }
        );
    },
};
