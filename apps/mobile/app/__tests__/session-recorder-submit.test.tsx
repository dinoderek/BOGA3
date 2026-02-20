import { fireEvent, render, screen } from '@testing-library/react-native';

import SessionRecorderScreen from '../session-recorder';

describe('SessionRecorderScreen submit validation', () => {
  it('shows required field validation and blocks submit when gym and exercises are missing', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Submit Session'));

    expect(screen.getByText('Select a gym before submitting.')).toBeTruthy();
    expect(screen.getByText('Log at least one exercise before submitting.')).toBeTruthy();
    expect(screen.queryByText('Session submitted (UI only)')).toBeNull();
  });

  it('allows correction and successful resubmit after set validation errors', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Choose gym'));
    fireEvent.press(screen.getByLabelText('Select gym Westside Barbell Club'));
    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Barbell Squat'));

    fireEvent.press(screen.getByText('Submit Session'));
    expect(screen.getByText('Enter weight and reps for every set before submitting.')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 1'), '225');
    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 1'), '5');
    fireEvent.press(screen.getByText('Submit Session'));

    expect(screen.queryByText('Enter weight and reps for every set before submitting.')).toBeNull();
    expect(screen.getByText('Session submitted (UI only)')).toBeTruthy();
    expect(screen.getByText('This session is not saved to local storage or backend yet.')).toBeTruthy();
  });

  it('shows submit summary and supports start new entry reset', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Choose gym'));
    fireEvent.press(screen.getByLabelText('Select gym Downtown Iron Temple'));
    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Deadlift'));
    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 1'), '315');
    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 1'), '3');
    fireEvent.press(screen.getByText('Submit Session'));

    expect(screen.getByText('Session submitted (UI only)')).toBeTruthy();
    expect(screen.getByText('Gym: Downtown Iron Temple')).toBeTruthy();
    expect(screen.getByText('Exercises: 1')).toBeTruthy();
    expect(screen.getByText('Sets: 1')).toBeTruthy();

    fireEvent.press(screen.getByText('Start new entry'));

    expect(screen.queryByText('Session submitted (UI only)')).toBeNull();
    expect(screen.getByText('Choose gym')).toBeTruthy();
    expect(screen.getByText('No exercises logged yet.')).toBeTruthy();
    expect(screen.queryByDisplayValue('315')).toBeNull();
    expect(screen.queryByDisplayValue('3')).toBeNull();
  });
});
