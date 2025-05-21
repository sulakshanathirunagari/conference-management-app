import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SessionMaterials from './SessionMaterials';
import React from 'react';

// Mock props
const mockSessions = [
    {
        _id: 's1',
        title: 'Intro to ML',
        eventId: 'e1',
        eventTitle: 'AI Summit',
        startTime: new Date().toISOString()
    }
];

describe('SessionMaterials', () => {
    beforeEach(() => {
        global.fetch = vi.fn().mockImplementation((url) => {
            if (url.includes('materials')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ data: [] })
                });
            }
            return Promise.reject(new Error('Invalid URL'));
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders session title and event title for each session', async () => {
        render(<SessionMaterials sessions={mockSessions} currentUser={{ _id: 'u1' }} />);
        await waitFor(() => {
            expect(screen.getByText('Intro to ML')).toBeInTheDocument();
            expect(screen.getByText('AI Summit')).toBeInTheDocument();
        });
    });

    it('file selection updates uploadState', async () => {
        render(<SessionMaterials sessions={mockSessions} currentUser={{ _id: 'u1' }} />);
        await waitFor(() => screen.getByText('Intro to ML'));

        const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' });
        const input = screen.getByLabelText(/select files/i);
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() =>
            expect(screen.getByText('test.pdf')).toBeInTheDocument()
        );
    });
});