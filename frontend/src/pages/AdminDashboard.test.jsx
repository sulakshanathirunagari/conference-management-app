import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import { MemoryRouter } from 'react-router-dom';

describe('AdminDashboard Component', () => {
    beforeEach(() => {
        // Mock fetch for logout
        global.fetch = vi.fn(() => Promise.resolve({ ok: true }));
        delete window.location;
        window.location = { href: '' };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders KPI cards correctly', () => {
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        expect(screen.getByText('Total Conferences')).toBeInTheDocument();
        expect(screen.getByText('Total Organizers')).toBeInTheDocument();
        expect(screen.getByText('Total Speakers')).toBeInTheDocument();
        expect(screen.getByText('Total Attendees')).toBeInTheDocument();
    });

    it('renders recent users table rows', () => {
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        expect(screen.getByText('Attendee')).toBeInTheDocument();
    });

    it('renders upcoming conferences', () => {
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        expect(screen.getByText('Web Development Summit 2025')).toBeInTheDocument();
        expect(screen.getByText('AI & Machine Learning Conference')).toBeInTheDocument();
        expect(screen.getByText('DevOps & Cloud Computing Expo')).toBeInTheDocument();
    });

    it('handles logout action', async () => {
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/logout', expect.anything());
    });
});