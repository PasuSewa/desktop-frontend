import React, { FC, useState, useEffect } from "react"

/************************************************************************************ mui related */
import { Container, Grid, Button, Typography } from "@material-ui/core"
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"

/************************************************************************************ redux related */
import { showError } from "../redux/actions/errorHandlingActions"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../redux/store"

import { translate } from "../lang"

/************************************************************************************ indexedDB */
import { DBErrorT, getCredentials, getUser, initiateDB } from "../misc/indexedDB"

/************************************************************************************ types & components */
import OrderBar, { By, Direction } from "../components/OrderBar"
import CredentialCard, { CredentialT } from "../components/CredentialCard"
import Downloads from "../components/Sections/Downloads"
import Snackbar from "../components/Snackbar"
import FeedbackForm from "../components/FeedbackForm"

/************************************************************************************ ajax */
import { ApiResponseGetCredentialsT, getCredentialsFromApi } from "../misc/ajaxManager"

type Sort = {
	by: By
	direction: Direction
}

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		container: {
			paddingTop: "7rem",

			[theme.breakpoints.down("xs")]: {
				paddingTop: "1rem",
			},
		},
		error: {
			minHeight: "100vh",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			textAlign: "center",
			flexDirection: "column",
		},
		errorBtn: {
			color: "white",
			background: theme.palette.error.main,
			"&:hover": {
				background: theme.palette.error.dark,
			},
		},
	})
)

const MyCredentials: FC = () => {
	const { token } = useSelector((state: RootState) => state.token)
	const { lng } = useSelector((state: RootState) => state.lng)

	const classes = useStyles()

	const dispatch = useDispatch()

	const [credentials, setCredentials] = useState<CredentialT[]>([])

	const [availableSlots, setAvailableSlots] = useState<number>(0)

	const [error, setError] = useState<boolean>(false)

	const [snackbarMessage, setSnackbarMessage] = useState("")

	useEffect(() => {
		getCredentials().then((data) => {
			if (data.userData && data.credentials) {
				setAvailableSlots(data.userData.slots_available)

				setCredentials(data.credentials)
			} else {
				setError(true)

				setSnackbarMessage(translate("error_messages", lng, 0))

				console.log(data.error)
			}
		})
	}, [])

	const orderBy = (sort: Sort) => {
		// the [...credentials] is very important, since a sorted array its still the same,
		// and thus react won't update state after re order the array.
		// so we need to copy it, creating a new array in the proces, then sorting it, and the finally update the state
		const credentialsSorted = [...credentials].sort((prev, next) => {
			if (prev[sort.by] > next[sort.by]) {
				return 1 * sort.direction
			}

			if (prev[sort.by] < next[sort.by]) {
				return -1 * sort.direction
			}

			return 0
		})
		setCredentials(credentialsSorted)
	}

	const getFromApi = async () => {
		setError(false)

		let localUser = await getUser().then((user: any) => user)

		if (localUser === undefined || localUser.failed) {
			return fatalError(localUser)
		}

		const newCredentials: ApiResponseGetCredentialsT = getCredentialsFromApi(
			localUser.id,
			token
		)

		localUser.availableSlots = newCredentials.slots_available

		initiateDB(localUser, newCredentials.user_credentials).then((result: any) => {
			if (result.failed) {
				fatalError(result)
			}
		})

		setAvailableSlots(newCredentials.slots_available)

		setCredentials(newCredentials.user_credentials)
	}

	const fatalError = (error: DBErrorT) => {
		setError(true)

		setSnackbarMessage(translate("error_messages", lng, 2))

		console.log({ error })

		dispatch(showError(translate("error_messages", lng, 0)))
	}

	return (
		<>
			<Container
				maxWidth="lg"
				className={classes.container}
				data-testid="test_my_credentials_page"
			>
				<Grid container justify="space-around" spacing={4}>
					{!error ? (
						<>
							<OrderBar sortCredentials={orderBy} />
							<CredentialCard
								availableSlots={availableSlots}
								credentials={credentials}
							/>
						</>
					) : (
						<>
							<Grid item xs={12} className={classes.error}>
								<Typography variant="subtitle1" gutterBottom paragraph>
									{translate("error_messages", lng, 1)}
								</Typography>
								<Button
									variant="contained"
									className={classes.errorBtn}
									disableElevation
									size="large"
									onClick={getFromApi}
								>
									{translate("retry", lng)}
								</Button>
							</Grid>
							<Snackbar open={error} message={snackbarMessage} />
						</>
					)}
				</Grid>
			</Container>
			<FeedbackForm />
			<Downloads testing />
		</>
	)
}

export default MyCredentials
