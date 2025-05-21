import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationList from './NotificationList';

beforeAll(() => {
    localStorage.setItem('userId', '123');
});

describe('NotificationList Component', () => {
    const mockNotifications = [
        {
            _id: 'notif1',
            title: 'Update Available',
            message: 'A new update has been deployed.',
            type: 'update',
            createdAt: '2025-04-14T10:00:00Z',
            isRead: { '123': true }
        },
        {
            _id: 'notif2',
            title: 'Event Reminder',
            message: 'Don’t forget your session at 2 PM.',
            type: 'info',
            createdAt: '2025-04-14T09:00:00Z',
            isRead: { '123': false }
        }
    ];

    it('renders without crashing', () => {
        render(<NotificationList notifications={mockNotifications} />);
    });

    it('displays notifications passed as props', () => {
        render(<NotificationList notifications={mockNotifications} />);

        // Check titles
        expect(screen.getByText('Update Available')).toBeInTheDocument();
        expect(screen.getByText('Event Reminder')).toBeInTheDocument();

        // Check messages
        expect(screen.getByText('A new update has been deployed.')).toBeInTheDocument();
        expect(screen.getByText('Don’t forget your session at 2 PM.')).toBeInTheDocument();
    });
});