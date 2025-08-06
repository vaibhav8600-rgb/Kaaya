import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../pages/Home';
import { UserContext } from '../context/UserContext';

const mockUpdateUser = jest.fn();
const baseUser = {
  id: '1',
  name: 'Test',
  weeklyGoal: 400,
  currentSetsDone: 10,
};

describe('Home Weekly Goal', () => {
  afterEach(() => { jest.clearAllMocks(); });

  it('shows default goal if not set', () => {
    render(
      <UserContext.Provider value={{ currentUser: { ...baseUser, weeklyGoal: undefined }, updateUser: mockUpdateUser }}>
        <Home />
      </UserContext.Provider>
    );
    expect(screen.getByText(/400 sets/)).toBeInTheDocument();
  });

  it('shows user-set goal', () => {
    render(
      <UserContext.Provider value={{ currentUser: { ...baseUser, weeklyGoal: 250 }, updateUser: mockUpdateUser }}>
        <Home />
      </UserContext.Provider>
    );
    expect(screen.getByText(/250 sets/)).toBeInTheDocument();
  });

  it('allows editing and saving a new goal', () => {
    render(
      <UserContext.Provider value={{ currentUser: baseUser, updateUser: mockUpdateUser }}>
        <Home />
      </UserContext.Provider>
    );
    fireEvent.click(screen.getByTitle('Edit goal'));
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '300' } });
    fireEvent.click(screen.getByText('Save'));
    expect(mockUpdateUser).toHaveBeenCalledWith('1', { weeklyGoal: 300 });
  });

  it('rejects invalid input', () => {
    render(
      <UserContext.Provider value={{ currentUser: baseUser, updateUser: mockUpdateUser }}>
        <Home />
      </UserContext.Provider>
    );
    fireEvent.click(screen.getByTitle('Edit goal'));
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '-5' } });
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText(/positive integer/)).toBeInTheDocument();
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('resets to default on reset', () => {
    render(
      <UserContext.Provider value={{ currentUser: { ...baseUser, weeklyGoal: 999 }, updateUser: mockUpdateUser }}>
        <Home />
      </UserContext.Provider>
    );
    fireEvent.click(screen.getByTitle('Edit goal'));
    fireEvent.click(screen.getByText('Reset'));
    expect(mockUpdateUser).toHaveBeenCalledWith('1', { weeklyGoal: 400 });
  });
});
