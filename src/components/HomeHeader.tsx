import faceTheFactsLogoNoText from '../assets/images/Logo_without_text.svg';
import './HomeHeader.css';
import React from 'react';
import { NavLink } from 'react-router-dom';

/* Define the React component (FC stands for Functional Components, as opposed to class-based components) */
const HomeHeader: React.FC = () => {
	/* This is returned when using this component */

	return (
		<div className="homeheader">
			<NavLink className="homeheader-logo" id="home" to={'/'}>
				<img src={faceTheFactsLogoNoText} alt="logo" />
			</NavLink>
			<div>
				<a
					href="https://drive.google.com/drive/folders/17sCDsL5kK9qAm0bjo7t0oT4AhHTAhRLI"
					className="homeheader-navbar"
				>
					PRESSE KIT
				</a>
				<NavLink
					to={'/contact'}
					className="homeheader-navbar homeheader-navbar-second"
					activeClassName="homeheader-navbar homeheader-navbar-activ"
				>
					KONTAKT
				</NavLink>
			</div>
		</div>
	);
};

export default HomeHeader;
