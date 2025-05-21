import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationPanel from './NotificationPanel';
import React from 'react';

// Mock NotificationList to avoid deep dependency issues
vi.mock('./NotificationList', () => ({
    default: ({ notifications }) => (
        <ul data-testid="mock-list">
            {notifications.map((n) => (
                <li key={n._id}>{n.title}</li>
            ))}
        </ul>
    )
}));

describe('NotificationPanel', () => {
    const mockData = [
        {
            _id: 'n1',
            title: 'Test Notification 1',
            isRead: { testuser: false }
        },
        {
            _id: 'n2',
            title: 'Test Notification 2',
            isRead: { testuser: true }
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('userId', 'testuser');

        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockData })
            });
    });

    it('renders bell icon with unread badge', async () => {
        render(<NotificationPanel />);
        await waitFor(() => {
            expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
            expect(screen.getByText('1')).toBeInTheDocument(); // 1 unread
        });
    });

    it('toggles notification panel on bell click', async () => {
        render(<NotificationPanel />);
        fireEvent.click(screen.getByLabelText('Notifications'));

        await waitFor(() => {
            expect(screen.getByText('Notifications')).toBeInTheDocument(); // Panel heading
            expect(screen.getByText('1 unread')).toBeInTheDocument();
        });
    });

    it('displays error message if fetch fails', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false
        });

        render(<NotificationPanel />);
        fireEvent.click(screen.getByLabelText('Notifications'));

        await waitFor(() => {
            expect(screen.getByText(/Failed to fetch notifications/i)).toBeInTheDocument();
        });
    });

    it('renders NotificationList with data when loaded', async () => {
        render(<NotificationPanel />);
        fireEvent.click(screen.getByLabelText('Notifications'));

        await waitFor(() => {
            expect(screen.getByTestId('mock-list')).toBeInTheDocument();
            expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
            expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
        });
    });
});