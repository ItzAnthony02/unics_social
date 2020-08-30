import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { APIUser } from '@unicsmcr/unics_social_api_client';
import { client } from '../../components/util/makeClient';
import { setJWT } from './AuthSlice';
import asAPIError from '../../components/util/asAPIError';

interface UsersSliceState {
	me: string|null;
	values: {
		[id: string]: APIUser|undefined;
	};
}

const initialState: UsersSliceState = {
	me: null,
	values: {}
};

const wrapApiError = error => {
	const apiError = asAPIError(error);
	if (apiError) {
		return Promise.reject(new Error(apiError));
	}
	return Promise.reject(error);
};

export const fetchMe = createAsyncThunk('users/fetchMe', () => client.getMe().catch(wrapApiError));
export const fetchUser = createAsyncThunk('users/fetchUser', (id: string) => client.getUser(id).catch(wrapApiError));

export const UsersSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		addUser: (state, action) => {
			const user: APIUser = action.payload.user;
			state.values[user.id] = user;
		}
	},
	extraReducers(builder) {
		builder.addCase(fetchUser.fulfilled, (state, action) => {
			const user: APIUser = action.payload;
			state.values[user.id] = user;
		});

		builder.addCase(fetchMe.fulfilled, (state, action) => {
			const user: APIUser = action.payload;
			if (state.values[user.id]) Object.assign(state.values[user.id], user);
			else state.values[user.id] = user;
			state.me = user.id;
		});

		builder.addCase(setJWT, state => {
			state.me = null;
		});
	}
});

export const { addUser } = UsersSlice.actions;

export const selectUserById = (id: string) => state => state.users.values[id];
export const selectMe = state => state.users.values[state.users.me] as APIUser|undefined;

export default UsersSlice.reducer;