import { render, screen, waitFor } from '@testing-library/react';
import TicketPayment from './TicketPayment';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock Stripe modules
vi.mock('@stripe/stripe-js', () => ({
    loadStripe: vi.fn(() => Promise.resolve({})),
}));

vi.mock('@stripe/react-stripe-js', () => ({
    Elements: ({ children }) => <div>{children}</div>,
    CardElement: () => <input data-testid="mock-card-element" />,
    useStripe: () => ({
        confirmCardPayment: vi.fn(() => ({ paymentIntent: { status: 'succeeded' } })),
    }),
    useElements: () => ({
        getElement: () => ({})
    })
}));

describe('TicketPayment Component', () => {
    beforeEach(() => {
        global.fetch = vi.fn()
            // Fetch current user
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ user: { _id: 'user1', fullName: 'John Doe', email: 'john@example.com' } })
            })
            // Fetch event
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: {
                        _id: 'event123',
                        title: 'Test Event',
                        location: 'Dallas',
                        startDate: new Date().toISOString(),
                        attendees: [],
                        price: 10,
                        ticketTypes: [
                            { _id: 'ticket1', name: 'VIP', price: 10, description: 'VIP seat' }
                        ]
                    }
                })
            })
            // Create payment intent
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ clientSecret: 'secret123', ticketId: 'ticketABC' })
            })
            // Confirm payment
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders event title and ticket selection', async () => {
        render(
            <MemoryRouter initialEntries={["/events/event123/tickets"]}>
                <Routes>
                    <Route path="/events/:id/tickets" element={<TicketPayment />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Purchase Tickets')).toBeInTheDocument();
            expect(screen.getByText('Test Event')).toBeInTheDocument();
            expect(screen.getByText('VIP')).toBeInTheDocument();
        });
    });
});