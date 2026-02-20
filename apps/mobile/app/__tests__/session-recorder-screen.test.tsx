import { fireEvent, render, screen } from '@testing-library/react-native';

import SessionRecorderScreen from '../session-recorder';

describe('SessionRecorderScreen', () => {
  it('renders the baseline session recorder shell', () => {
    render(<SessionRecorderScreen />);

    expect(screen.getByText('Date and Time')).toBeTruthy();
    expect(screen.getByText('Gym')).toBeTruthy();
    expect(screen.getByText('Choose gym')).toBeTruthy();
    expect(screen.getByText('Log new exercise')).toBeTruthy();
    expect(screen.getByText('No exercises logged yet.')).toBeTruthy();
    expect(screen.queryByText('Barbell Squat')).toBeNull();
    expect(screen.getByText('Submit Session')).toBeTruthy();
    expect(screen.queryByLabelText('Select gym Downtown Iron Temple')).toBeNull();
  });

  it('prefills date and time with the current value pattern', () => {
    render(<SessionRecorderScreen />);

    expect(screen.getByText(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)).toBeTruthy();
    expect(screen.queryByPlaceholderText('YYYY-MM-DD HH:mm')).toBeNull();
  });

  it('supports picker selection and add new gym flow', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Choose gym'));
    expect(screen.getByText('Select Gym')).toBeTruthy();

    expect(screen.getByLabelText('Select gym Downtown Iron Temple')).toBeTruthy();
    expect(screen.getByLabelText('Select gym Westside Barbell Club')).toBeTruthy();
    expect(screen.getByLabelText('Select gym North End Strength Lab')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Select gym Westside Barbell Club'));
    expect(screen.getByText('Westside Barbell Club')).toBeTruthy();

    fireEvent.press(screen.getByText('Westside Barbell Club'));
    fireEvent.press(screen.getByText('Add new'));
    expect(screen.getByText('Add Gym')).toBeTruthy();
    expect(screen.queryByText('Manage')).toBeNull();
    expect(screen.queryByLabelText('Select gym Downtown Iron Temple')).toBeNull();

    fireEvent.changeText(screen.getByPlaceholderText('Gym name'), 'Southside Fitness Forge');
    fireEvent.press(screen.getByText('Add'));

    expect(screen.getByText('Southside Fitness Forge')).toBeTruthy();
  });

  it('supports manage gyms edit/archive/filter/unarchive flow', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Choose gym'));
    fireEvent.press(screen.getByText('Manage'));
    expect(screen.getByText('Manage Gyms')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Edit gym Downtown Iron Temple'));
    fireEvent.changeText(screen.getByDisplayValue('Downtown Iron Temple'), 'Downtown Iron Works');
    fireEvent.press(screen.getByText('Save'));

    expect(screen.getByText('Downtown Iron Works')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Archive gym Downtown Iron Works'));
    expect(screen.queryByText('Downtown Iron Works')).toBeNull();

    fireEvent.press(screen.getByText('Show archived'));
    expect(screen.getByText('Downtown Iron Works')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Unarchive gym Downtown Iron Works'));
    fireEvent.press(screen.getByText('Hide archived'));
    fireEvent.press(screen.getByText('Back to picker'));
    expect(screen.getByText('Select Gym')).toBeTruthy();

    fireEvent.press(screen.getByText('Choose gym'));
    expect(screen.getByLabelText('Select gym Downtown Iron Works')).toBeTruthy();
  });

  it('dismisses the gym modal when pressing outside', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Choose gym'));
    expect(screen.getByText('Select Gym')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Dismiss gym modal overlay'));
    expect(screen.queryByText('Select Gym')).toBeNull();
  });
});
