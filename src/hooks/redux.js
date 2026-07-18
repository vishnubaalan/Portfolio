import { useDispatch, useSelector } from 'react-redux';

/** @returns {import('../store').AppDispatch} */
export const useAppDispatch = () => useDispatch();

/** @type {import('react-redux').TypedUseSelectorHook<import('../store').RootState>} */
export const useAppSelector = useSelector;
