import { render, screen, fireEvent } from '@testing-library/react';
import EventList from './EventList';
import React from 'react';

describe('EventList', () => {
    const mockEvents = [
        {
            _id: '1',
            title: 'Tech Summit',
            startDate: '2025-05-01',
            endDate: '2025-05-02',
            location: 'San Francisco',
            attendees: ['a1', 'a2'],
            capacity: 100,
            description: 'Annual tech conference.',
            status: 'published',
            tags: ['AI', 'Cloud'],
            coverImage: ''
        }
    ];

    const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn()
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('shows no events message when event list is empty', () => {
        render(<EventList events={[]} loading={false} {...mockHandlers} />);
        expect(screen.getByText(/No Events Found/i)).toBeInTheDocument();
    });

    it('renders event card with title, location, and description', () => {
        render(<EventList events={mockEvents} loading={false} {...mockHandlers} />);
        expect(screen.getByText('Tech Summit')).toBeInTheDocument();
        expect(screen.getByText('San Francisco')).toBeInTheDocument();
        expect(screen.getByText(/Annual tech conference/i)).toBeInTheDocument();
        expect(screen.getByText(/AI/i)).toBeInTheDocument();
    });

    it('calls onView when view button is clicked', () => {
        render(<EventList events={mockEvents} loading={false} {...mockHandlers} />);
        fireEvent.click(screen.getByTitle('View Details'));
        expect(mockHandlers.onView).toHaveBeenCalledWith(mockEvents[0]);
    });

    it('calls onEdit when edit button is clicked', () => {
        render(<EventList events={mockEvents} loading={false} {...mockHandlers} />);
        fireEvent.click(screen.getByTitle('Edit Event'));
        expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockEvents[0]);
    });

    it('calls onDelete when delete button is clicked', () => {
        render(<EventList events={mockEvents} loading={false} {...mockHandlers} />);
        fireEvent.click(screen.getByTitle('Delete Event'));
        expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
    });
});