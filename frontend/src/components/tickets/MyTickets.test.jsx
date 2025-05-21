import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MyTickets from './MyTickets';
import { MemoryRouter } from 'react-router-dom';

describe('MyTickets Component', () => {
    const mockUser = {
        user: {
            fullName: 'Test User',
        }
    };

    const mockTickets = {
        data: [
            {
                _id: 'ticket123456',
                ticketType: { name: 'General Admission', price: 10 },
                event: {
                    _id: 'event123',
                    title: 'Mock Event',
                    location: 'Test City',
                    startDate: new Date().toISOString(),
                    coverImage: '',
                },
                purchaseDate: new Date().toISOString(),
                paymentStatus: 'completed',
                isCheckedIn: false,
                qrCodeData: 'data:image/png;base64,QR_CODE',
            }
        ]
    };

    beforeEach(() => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockUser,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockTickets,
            });

        global.open = vi.fn(() => ({
            document: {
                write: vi.fn(),
                close: vi.fn(),
            }
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('displays ticket after successful fetch', async () => {
        render(<MemoryRouter><MyTickets /></MemoryRouter>);
        expect(await screen.findByText('My Tickets')).toBeInTheDocument();
        expect(screen.getByText('Mock Event')).toBeInTheDocument();
        expect(screen.getByText('General Admission')).toBeInTheDocument();
    });

    it('displays error message when fetch fails', async () => {
        vi.restoreAllMocks(); // clear earlier mocks
        global.fetch = vi.fn(() => Promise.reject(new Error('Failed')));
        render(<MemoryRouter><MyTickets /></MemoryRouter>);
        expect(await screen.findByText(/error fetching tickets/i)).toBeInTheDocument();
    });

    it('displays login prompt if not logged in', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] })
            });

        render(<MemoryRouter><MyTickets /></MemoryRouter>);
        expect(await screen.findByText('Not Logged In')).toBeInTheDocument();
    });

    it('handles no tickets case', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockUser,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            });

        render(<MemoryRouter><MyTickets /></MemoryRouter>);
        expect(await screen.findByText(/You Don't Have Any Tickets Yet/i)).toBeInTheDocument();
    });

    it('triggers download/print on click', async () => {
        render(<MemoryRouter><MyTickets /></MemoryRouter>);
        const downloadButton = await screen.findByTitle('Download Ticket');
        fireEvent.click(downloadButton);
        expect(global.open).toHaveBeenCalled();
    });
});