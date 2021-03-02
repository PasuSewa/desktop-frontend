import React, { useEffect, useState } from "react"
import {
	Box,
	Grid,
	Button,
	InputAdornment,
	OutlinedInput,
	InputLabel,
	FormControl,
} from "@material-ui/core"

import TimerButton from "../../../TimerButton"

import { useSelector } from "react-redux"
import { RootState } from "../../../../redux/store"
import { translate } from "../../../../lang"

type Props = {
	isRecovery: boolean
	isRobot: boolean
	testing?: boolean
}

const EmailCode = ({ testing, isRobot, isRecovery }: Props) => {
	const { lng } = useSelector((state: RootState) => state.lng)

	const [canSubmit, setCanSubmit] = useState(false)

	const handleClick = () => {
		setCanSubmit(true)

		if (testing) {
			console.log("hola mundo")
		} else {
			console.log("production api call")
		}
	}

	return (
		<Box component="div">
			<Grid container justify="center" spacing={3}>
				<Grid item xs={12} sm={6}>
					<Grid container justify="center" spacing={3}>
						{isRecovery && (
							<Grid item xs={12}>
								<FormControl variant="outlined" fullWidth>
									<InputLabel htmlFor="outlined-adornment-password">
										{translate("auth_form_texts", lng, 2)}
									</InputLabel>
									<OutlinedInput label={translate("auth_form_texts", lng, 2)} />
								</FormControl>
							</Grid>
						)}
						<Grid item xs={12}>
							<FormControl variant="outlined" fullWidth>
								<InputLabel htmlFor="outlined-adornment-password">
									{isRecovery
										? translate("auth_form_texts", lng, 3)
										: translate("auth_form_texts", lng, 0)}
								</InputLabel>
								<OutlinedInput
									label={
										isRecovery
											? translate("auth_form_texts", lng, 3)
											: translate("auth_form_texts", lng, 0)
									}
									endAdornment={
										<InputAdornment position="end" onClick={handleClick}>
											{isRobot ? (
												<Button size="small" disabled variant="contained">
													{translate("send_email", lng)}
												</Button>
											) : (
												<TimerButton title={translate("send_email", lng)} />
											)}
										</InputAdornment>
									}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<FormControl variant="outlined" fullWidth>
								<InputLabel htmlFor="outlined-adornment-password">
									{translate("auth_form_texts", lng, 1)}
								</InputLabel>
								<OutlinedInput label={translate("auth_form_texts", lng, 1)} />
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<Button
								variant="contained"
								color="primary"
								fullWidth
								disableElevation
								disabled={!canSubmit}
							>
								{translate("navbar_login_btn", lng)}
							</Button>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Box>
	)
}

export default EmailCode
