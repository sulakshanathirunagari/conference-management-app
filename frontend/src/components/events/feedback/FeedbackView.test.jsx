import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FeedbackView from './FeedbackView';
import { MemoryRouter } from 'react-router-dom';

const mockFeedbackData = {
    data: [
        {
            sessionId: 'session123',
            sessionTitle: 'React Basics',
            eventTitle: 'Frontend Conf 2025',
            stats: {
                averageRating: 4.5,
                totalFeedback: 2,
                ratingCounts: { 5: 1, 4: 1, 3: 0, 2: 0, 1: 0 }
            },
            feedback: [
                {
                    _id: 'f1',
                    rating: 5,
                    comment: 'Great session!',
                    createdAt: new Date().toISOString(),
                    attendee: { fullName: 'Alice' },
                },
                {
                    _id: 'f2',
                    rating: 4,
                    comment: 'Very informative.',
                    createdAt: new Date().toISOString(),
                    attendee: { fullName: 'Bob' },
                },
            ]
        }
    ]
};

describe('FeedbackView Component', () => {
    beforeEach(() => {
        global.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockFeedbackData),
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders feedback data correctly', async () => {
        render(<MemoryRouter><FeedbackView /></MemoryRouter>);

        expect(await screen.findByText('My Session Feedback')).toBeInTheDocument();
        expect(screen.getByText('React Basics')).toBeInTheDocument();
        expect(screen.getByText('Frontend Conf 2025')).toBeInTheDocument();
        expect(screen.getByText('2 ratings')).toBeInTheDocument();
    });

    it('shows attendee comments when expanded', async () => {
        render(<MemoryRouter><FeedbackView /></MemoryRouter>);

        await waitFor(() => screen.getByText('React Basics'));

        fireEvent.click(screen.getByRole('button', { name: '' })); // Chevron button

        expect(await screen.findByText('Great session!')).toBeInTheDocument();
        expect(screen.getByText('Very informative.')).toBeInTheDocument();
    });

    it('handles fetch error gracefully', async () => {
        vi.restoreAllMocks();
        global.fetch = vi.fn(() => Promise.reject(new Error('Fetch error')));

        render(<MemoryRouter><FeedbackView /></MemoryRouter>);

        expect(await screen.findByText(/failed to load feedback/i)).toBeInTheDocument();
    });

    it('shows message when no feedback is available', async () => {
        global.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
        }));

        render(<MemoryRouter><FeedbackView /></MemoryRouter>);

        expect(await screen.findByText(/No Feedback Yet/i)).toBeInTheDocument();
    });
});