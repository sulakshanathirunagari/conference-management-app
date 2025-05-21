import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from './RegisterPage';
import { MemoryRouter } from 'react-router-dom';

describe('RegisterPage', () => {
    let originalFetch;
    let originalLocation;

    beforeEach(() => {
        originalFetch = global.fetch;
        global.fetch = vi.fn();
        originalLocation = window.location;
        delete window.location;
        window.location = { href: '' };
    });

    afterEach(() => {
        global.fetch = originalFetch;
        window.location = originalLocation;
    });

    it('displays success message after registration', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: {}, token: 'abc' }),
        });

        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'secure123' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'secure123' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

        await waitFor(() => {
            expect(screen.getByText(/Registration Successful/i)).toBeInTheDocument();
        });
    });

    it('displays server error message', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Email already registered' }),
        });

        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

        await waitFor(() => {
            expect(screen.getByText(/Email already registered/i)).toBeInTheDocument();
        });
    });
});