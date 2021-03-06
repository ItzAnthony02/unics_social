import React, { ReactNode, useCallback, useEffect } from 'react';

import { Route, Redirect, withRouter, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectJWT, selectConnected } from '../../store/slices/AuthSlice';
import { initClientGateway, client } from './makeClient';
import { makeStyles, Backdrop, CircularProgress, Typography, Box } from '@material-ui/core';
import { selectMe, fetchMe } from '../../store/slices/UsersSlice';
import { fetchNotes, selectNotesFetched } from '../../store/slices/NotesSlice';

const useStyles = makeStyles(theme => ({
	backdrop: {
		'zIndex': theme.zIndex.drawer + 1,
		'color': '#fff',
		'flexDirection': 'column',
		'textAlign': 'center',
		'& > *': {
			margin: theme.spacing(4, 0)
		}
	}
}));

const ProtectedRoute = props => {
	const { component: Component, ...rest } = props;
	const dispatch = useCallback(useDispatch(), []);
	const jwt = useSelector(selectJWT);
	const connected = useSelector(selectConnected);
	const me = useSelector(selectMe);
	const haveNotes = useSelector(selectNotesFetched);
	const classes = useStyles();
	const history = useHistory();

	const isAccountPage = history.location.pathname === '/account';

	useEffect(() => {
		if (!connected) initClientGateway(client);
		if (!me) dispatch(fetchMe());
		if (!haveNotes) dispatch(fetchNotes());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch]);

	let fallback: ReactNode|undefined;
	if (jwt && (!me || !connected || !haveNotes)) {
		fallback = <Backdrop open={true} className={classes.backdrop}>
			<Typography variant="h4">Connecting to UniCS KB</Typography>
			<Box>
				<CircularProgress color="inherit" />
			</Box>
		</Backdrop>;
	} else if (jwt && me && !me.profile && !isAccountPage) {
		fallback = <Redirect to="/account" />;
	}	else if (!jwt) {
		fallback = <Redirect to="/login" />;
	}

	return (
		<Route
			{...rest}
			render={props =>
				fallback ?? <Component {...props} />
			}
		/>
	);
};

export default withRouter(ProtectedRoute);
