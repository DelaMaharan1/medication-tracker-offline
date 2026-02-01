import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemedText } from '../themed-text';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
    useThemeColor: jest.fn(() => '#000000'),
}));

describe('ThemedText', () => {
    it('renders correctly with default type', () => {
        const { getByText } = render(<ThemedText>Hello World</ThemedText>);
        expect(getByText('Hello World')).toBeTruthy();
    });

    it('renders correctly with title type', () => {
        const { getByText } = render(<ThemedText type="title">Title Text</ThemedText>);
        expect(getByText('Title Text')).toBeTruthy();
        // In a real test, we could check styles if needed
    });
});

