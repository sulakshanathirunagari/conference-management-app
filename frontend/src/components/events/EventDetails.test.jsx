import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EventDetails from './EventDetails';
import React from 'react';

describe('EventDetails - Static Text Rendering', () => {
    const mockEvent = {
        _id: 'event1',
        title: 'AI Conference',
        status: 'published',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        location: 'Dallas, TX',
        capacity: 100,
        price: 50,
        description: 'This is a test event description.',
        attendees: [],
        sessions: [],
        tags: ['AI', 'ML']
    };

    const defaultProps = {
        event: mockEvent,
        onEdit: () => { },
        onDelete: () => { },
        onBack: () => { },
        onRefresh: () => { }
    };

    it('renders event title', () => {
        render(
            <MemoryRouter>
                <EventDetails {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByText('AI Conference')).toBeInTheDocument();
    });

    it('renders location', () => {
        render(
            <MemoryRouter>
                <EventDetails {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByText('Dallas, TX')).toBeInTheDocument();
    });

    it('renders description', () => {
        render(
            <MemoryRouter>
                <EventDetails {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByText('This is a test event description.')).toBeInTheDocument();
    });

    it('renders "Overview" tab text', () => {
        render(
            <MemoryRouter>
                <EventDetails {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByRole('button', { name: /Overview/i })).toBeInTheDocument();
    });

    it('renders "Attendees" tab text', () => {
        render(
            <MemoryRouter>
                <EventDetails {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByRole('button', { name: /Attendees/i })).toBeInTheDocument();
    });

    it('renders "Sessions" tab text', () => {
        render(
            <MemoryRouter>
                <EventDetails {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByRole('button', { name: /Sessions/i })).toBeInTheDocument();
    });
});