import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';
import { MemoryRouter } from 'react-router-dom';

describe('LoginPage Component', () => {
    let originalFetch;
    let originalAlert;
    let originalLocalStorage;
    let originalLocation;

    beforeEach(() => {
        originalFetch = global.fetch;
        originalAlert = global.alert;
        originalLocalStorage = global.localStorage;
        originalLocation = window.location;

        global.fetch = vi.fn();
        global.alert = vi.fn();
        global.localStorage = {
            setItem: vi.fn(),
            getItem: vi.fn(),
        };
        delete window.location;
        window.location = { href: '' };
    });

    afterEach(() => {
        global.fetch = originalFetch;
        global.alert = originalAlert;
        global.localStorage = originalLocalStorage;
        window.location = originalLocation;
    });

    it('renders login form', () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
    });

    it('displays error message on failed login', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Invalid credentials' }),
        });

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
        });
    });

    it('redirects on successful login as organizer', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                user: { role: 'organizer', fullName: 'Test User' },
                token: 'fake-token'
            }),
        });

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'organizer@test.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('organizer'));
        });
    });
});