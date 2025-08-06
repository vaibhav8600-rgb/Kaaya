import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BodyAndWeight from '../pages/BodyAndWeight';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Minimal unit tests for BodyAndWeight to verify that entries can be added
 * and displayed.  In a real environment, additional tests would cover goal
 * progress calculations, chart rendering, and heatmap creation.
 */
test('allows adding and displaying weight entries', () => {
  const currentUser = { id: '1', name: 'Test', units: 'kg' };
  const updateUser = jest.fn();
  render(
    <UserContext.Provider value={{ currentUser, updateUser }}>
      <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: jest.fn() }}>
        <BodyAndWeight />
      </ThemeContext.Provider>
    </UserContext.Provider>,
  );
  const weightInput = screen.getByLabelText(/Weight/i);
  fireEvent.change(weightInput, { target: { value: '70' } });
  const addButton = screen.getByText(/Add Entry/i);
  fireEvent.click(addButton);
  expect(screen.getByText('70 kg')).toBeInTheDocument();
});