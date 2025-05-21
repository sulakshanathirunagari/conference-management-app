import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SessionChat from './SessionChat';
import React from 'react';

// Minimal mock data
const mockSessions = [
    {
        _id: 's1',
        title: 'Session 1'
    }
];

const mockQuestions = [
    {
        _id: 'q1',
        text: 'What is React?',
        status: 'pending',
        createdAt: new Date().toISOString(),
        askedBy: { fullName: 'User A' }
    },
    {
        _id: 'q2',
        text: 'Explain useState.',
        status: 'answered',
        createdAt: new Date().toISOString(),
        askedBy: { fullName: 'User B' },
        answer: {
            text: 'useState is a Hook that lets you manage state.',
            answeredAt: new Date().toISOString()
        }
    }
];

describe('SessionChat Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();

        global.fetch = vi.fn()
            // Fetch questions for session
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockQuestions })
            });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders session selector and titles correctly', async () => {
        render(<SessionChat currentUser={{ _id: 'u1' }} sessions={mockSessions} />);

        expect(await screen.findByText('Attendee Questions for Session 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Session 1')).toBeInTheDocument();
    });

    it('shows questions categorized by answered and unanswered', async () => {
        render(<SessionChat currentUser={{ _id: 'u1' }} sessions={mockSessions} />);

        expect(await screen.findByText('Questions Waiting for Answers (1)')).toBeInTheDocument();
        expect(screen.getByText('Answered Questions (1)')).toBeInTheDocument();
    });

    it('allows searching through questions', async () => {
        render(<SessionChat currentUser={{ _id: 'u1' }} sessions={mockSessions} />);

        await waitFor(() => screen.getByText('What is React?'));

        const searchBox = screen.getByPlaceholderText('Search questions...');
        fireEvent.change(searchBox, { target: { value: 'useState' } });

        expect(screen.queryByText('What is React?')).not.toBeInTheDocument();
        expect(screen.getByText('Explain useState.')).toBeInTheDocument();
    });
});