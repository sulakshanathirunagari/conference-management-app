import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SpeakerDashboard from './SpeakerDashboard';
import React from 'react';

// Mock fetch
beforeEach(() => {
    global.fetch = vi.fn()
        // Fetch current user
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: { _id: 'user1', fullName: 'John Doe', email: 'john@example.com' } })
        })
        // Fetch speaker sessions
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: [
                    {
                        _id: 'event1',
                        title: 'React Conf',
                        location: 'Austin',
                        sessions: [
                            {
                                _id: 'session1',
                                title: 'React Basics',
                                speaker: 'user1',
                                startTime: new Date(Date.now() + 86400000).toISOString(),
                                endTime: new Date(Date.now() + 90000000).toISOString(),
                                location: 'Room A',
                                capacity: 100
                            }
                        ]
                    }
                ]
            })
        });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('SpeakerDashboard', () => {

    it('navigates to Materials tab and shows prompt', async () => {
        render(<SpeakerDashboard />);
        await waitFor(() => screen.getByText('React Basics'));

        fireEvent.click(screen.getByText('Materials'));
        expect(screen.getByText('Select a Session')).toBeInTheDocument();
    });

    it('navigates to Notifications tab and displays message if none', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] })
            });

        render(<SpeakerDashboard />);
        await waitFor(() => screen.getByText('React Basics'));

        fireEvent.click(screen.getByText('Notifications'));
        await waitFor(() => screen.getByText("You don't have any notifications yet."));
    });
});