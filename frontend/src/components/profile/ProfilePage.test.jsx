import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from './ProfilePage';

const mockUser = {
    fullName: 'Tejaswini',
    email: 'tejaswini@example.com',
    organization: 'UTA',
    bio: 'Software Engineer',
    profileImage: ''
};

describe('ProfilePage Component', () => {
    it('renders with user data', () => {
        render(<ProfilePage currentUser={mockUser} />);

        expect(screen.getByDisplayValue('Tejaswini')).toBeInTheDocument();
        expect(screen.getByDisplayValue('tejaswini@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('UTA')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
    });

    it('updates input fields', () => {
        render(<ProfilePage currentUser={mockUser} />);

        const fullNameInput = screen.getByLabelText(/Full Name/i);
        fireEvent.change(fullNameInput, { target: { value: 'Teju' } });

        expect(fullNameInput.value).toBe('Teju');
    });


});